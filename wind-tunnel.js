// Configuration constants
const CONFIG = {
    CURSOR_RADIUS: 8,
    ASPECT_RATIO: 2, // width:height = 2:1
    BASE_WIDTH: 1500,
    BASE_HEIGHT: 750,
    SIMULATION_SCALE_MIN: 1,
    GRID_DIVISOR: 5,
    DIFFUSION_ITERATIONS: 10,
    PRESSURE_ITERATIONS: 30,
    HERO_DELAY: 2000, // 2-second delay for hero animations
    RESIZE_DEBOUNCE: 250
};

/**
 * Detect mobile/tablet devices for touch optimization
 * Conservative detection to preserve desktop cursor interaction while optimizing mobile performance
 * @returns {boolean} true if device is mobile/tablet, false for desktop computers
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

let actualWidth = CONFIG.BASE_WIDTH;
let actualHeight = CONFIG.BASE_HEIGHT;
let gridWidth = actualWidth / CONFIG.GRID_DIVISOR;
let gridHeight = actualHeight / CONFIG.GRID_DIVISOR;

// Function to update canvas size based on viewport
function updateCanvasSize() {
    const canvas = document.getElementById("myCanvas");
    
    // Maintain the original 2:1 aspect ratio for the simulation
    // but scale to fill the viewport appropriately
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    
    // Calculate the best fit for 2:1 aspect ratio
    let aspectRatio = CONFIG.ASPECT_RATIO; // width:height = 2:1
    let canvasWidth, canvasHeight;
    
    if (viewportWidth / viewportHeight > aspectRatio) {
        // Viewport is wider than 2:1, constrain by height
        canvasHeight = viewportHeight;
        canvasWidth = canvasHeight * aspectRatio;
    } else {
        // Viewport is taller than 2:1, constrain by width
        canvasWidth = viewportWidth;
        canvasHeight = canvasWidth / aspectRatio;
    }
    
    // Use a higher resolution for the simulation (scale up from base dimensions)
    // This maintains the physics accuracy while allowing for crisp visuals
    let simulationScale = Math.max(CONFIG.SIMULATION_SCALE_MIN, Math.min(canvasWidth / CONFIG.BASE_WIDTH, canvasHeight / CONFIG.BASE_HEIGHT));
    
    actualWidth = Math.floor(CONFIG.BASE_WIDTH * simulationScale);
    actualHeight = Math.floor(CONFIG.BASE_HEIGHT * simulationScale);
    gridWidth = actualWidth / CONFIG.GRID_DIVISOR;
    gridHeight = actualHeight / CONFIG.GRID_DIVISOR;
    
    // Update canvas element
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    
    // Set canvas display size to fill viewport while maintaining aspect ratio
    let displayWidth, displayHeight;
    if (viewportWidth / viewportHeight > aspectRatio) {
        // Viewport is wider than 2:1, constrain by height
        displayHeight = viewportHeight;
        displayWidth = displayHeight * aspectRatio;
    } else {
        // Viewport is taller than 2:1, constrain by width
        displayWidth = viewportWidth;
        displayHeight = displayWidth / aspectRatio;
    }
    
    // Apply display size and center the canvas
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    canvas.style.left = ((viewportWidth - displayWidth) / 2) + 'px';
    canvas.style.top = ((viewportHeight - displayHeight) / 2) + 'px';
    
    // Update cursor canvas
    if (cursorCanvas) {
        cursorCanvas.width = actualWidth;
        cursorCanvas.height = actualHeight;
    }
}

let gl, ext;
let view = "tx_material";

// Cursor interaction variables
let cursorX = -100; // Start off-screen
let cursorY = -100;
let cursorRadius = CONFIG.CURSOR_RADIUS; // Updated: smaller cursor for better precision
let cursorCanvas, cursorCtx; // For creating dynamic cursor texture
let heroImage = null; // Store the hero image for compositing

// initialization functions
function init() {
    // Update canvas size first
    updateCanvasSize();
    
    let canvas = document.getElementById("myCanvas");
    gl = canvas.getContext("webgl");
    ext = gl.getExtension("OES_texture_half_float");

    // Create cursor canvas for dynamic obstacle texture
    cursorCanvas = document.createElement('canvas');
    cursorCanvas.width = actualWidth;
    cursorCanvas.height = actualHeight;
    cursorCtx = cursorCanvas.getContext('2d');
    
    // Enable image smoothing for better scaling quality
    cursorCtx.imageSmoothingEnabled = true;
    cursorCtx.imageSmoothingQuality = 'high';

    // Add mouse event listeners for cursor tracking (desktop only)
    if (!isMobileDevice()) {
        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            // Calculate precise mouse position accounting for canvas scaling
            cursorX = Math.round((event.clientX - rect.left) * (actualWidth / rect.width));
            cursorY = Math.round((event.clientY - rect.top) * (actualHeight / rect.height));
            
            // Clamp to canvas bounds to prevent edge artifacts
            cursorX = Math.max(0, Math.min(cursorX, actualWidth - 1));
            cursorY = Math.max(0, Math.min(cursorY, actualHeight - 1));
        });

        canvas.addEventListener('mouseleave', function(event) {
            // Move cursor off-screen when mouse leaves canvas
            cursorX = -100;
            cursorY = -100;
        });
    } else {
        // On mobile devices, keep cursor off-screen to prevent touch scroll interference
        cursorX = -100;
        cursorY = -100;
    }

    // Load hero image and initialize canvas-based obstacle texture
    heroImage = new Image();  
    heroImage.onload = function() {
        // Create initial obstacle texture from canvas (hero image + cursor)
        resetTexture("tx_obstacle", actualWidth, actualHeight);
        updateCursorObstacle(); // This will draw hero image to canvas and update texture
    };
    heroImage.src = "assets/bighero.png";

    gl.disable(gl.DEPTH_TEST);

    // setup GLSL programs
    createProgram("reset_velocity", "vertex", "reset_velocity_fragment");
    createProgram("render_obstacle", "vertex", "obstacle_render_fragment");

    createProgram("obstacle_velocity", "vertex", "obstacle_velocity_fragment");
    setUniformForProgram("obstacle_velocity", "u_textureSize", [gridWidth, gridHeight], "2f");
    setUniformForProgram("obstacle_velocity", "u_velocity", 0, "1i");
    setUniformForProgram("obstacle_velocity", "u_obstacle", 1, "1i");

    createProgram("obstacle_pressure", "vertex", "obstacle_pressure_fragment");
    setUniformForProgram("obstacle_pressure", "u_textureSize", [gridWidth, gridHeight], "2f");
    setUniformForProgram("obstacle_pressure", "u_pressure", 0, "1i");
    setUniformForProgram("obstacle_pressure", "u_obstacle", 1, "1i");

    createProgram("render", "vertex", "render_fragment");
    setUniformForProgram("render", "u_textureSize", [actualWidth, actualHeight], "2f");
    setUniformForProgram("render", "u_screenSize", [actualWidth, actualHeight], "2f");
    setUniformForProgram("render", "u_material", 0, "1i");
    setUniformForProgram("render", "u_obstacle", 1, "1i");

    createProgram("gradient_subtraction", "vertex", "gradient_subtraction_fragment");
    setUniformForProgram("gradient_subtraction", "u_textureSize", [gridWidth, gridHeight], "2f");
    setUniformForProgram("gradient_subtraction", "u_velocity", 0, "1i");
    setUniformForProgram("gradient_subtraction", "u_pressure", 1, "1i");

    createProgram("diverge", "vertex", "divergence_fragment");
    setUniformForProgram("diverge", "u_textureSize", [gridWidth, gridHeight], "2f");
    setUniformForProgram("diverge", "u_velocity", 0, "1i");

    createProgram("jacobi", "vertex", "jacobi_diffusion_fragment");
    setUniformForProgram("jacobi", "u_textureSize", [gridWidth, gridHeight], "2f");
    setUniformForProgram("jacobi", "u_divergence", 0, "1i");
    setUniformForProgram("jacobi", "u_pressure", 1, "1i");

    createProgram("advect_material", "vertex", "advect_material_fragment");
    setUniformForProgram("advect_material", "u_textureSize", [gridWidth, gridHeight], "2f");
    setUniformForProgram("advect_material", "u_screenSize", [actualWidth, actualHeight], "2f");
    setUniformForProgram("advect_material", "u_material", 0, "1i");
    setUniformForProgram("advect_material", "u_velocity", 1, "1i");

    createProgram("advect_velocity", "vertex", "advect_velocity_fragment");
    setUniformForProgram("advect_velocity", "u_textureSize", [gridWidth, gridHeight], "2f");
    setUniformForProgram("advect_velocity", "u_velocity", 0, "1i");

    // Add window resize listener
    window.addEventListener('resize', function() {
        updateCanvasSize();
        // Reset textures with new dimensions
        resetTextures();
    });

    resetWindow();
    render();
}

// render functions
function render() {
    updateCursorObstacle();
    
    setSize(gridWidth, gridHeight);
    advectVelocity();
    applyDiffusion(CONFIG.DIFFUSION_ITERATIONS);
    applyProjection();

    setSize(actualWidth, actualHeight);
    advectMaterial();

    window.requestAnimationFrame(render);
}

function updateCursorObstacle() {
    // Clear and prepare cursor canvas
    cursorCtx.clearRect(0, 0, actualWidth, actualHeight);
    
    // Always draw the hero image as the base
    if (heroImage && heroImage.complete) {
        // Enable high-quality smoothing for better text antialiasing
        cursorCtx.save();
        cursorCtx.imageSmoothingEnabled = true;
        cursorCtx.imageSmoothingQuality = 'high';
        cursorCtx.drawImage(heroImage, 0, 0, actualWidth, actualHeight);
        cursorCtx.restore();
    } else {
        // Fallback: fill with white background if hero image isn't loaded yet
        cursorCtx.fillStyle = 'white';
        cursorCtx.fillRect(0, 0, actualWidth, actualHeight);
    }
    
    // Always add cursor circle on top if cursor is within canvas bounds
    if (cursorX >= 0 && cursorY >= 0 && cursorX < actualWidth && cursorY < actualHeight) {
        cursorCtx.fillStyle = 'black';
        cursorCtx.beginPath();
        // Add 0.5 offset for pixel-perfect alignment
        cursorCtx.arc(cursorX + 0.5, cursorY + 0.5, cursorRadius, 0, 2 * Math.PI);
        cursorCtx.fill();
    }
    
    // Always update the obstacle texture with the composite image
    updateTextureFromCanvas("tx_obstacle", cursorCanvas);
}

function advectVelocity() {
    executeShader("advect_velocity", ["tx_velocity"], "tx_next_velocity");
    executeShader("obstacle_velocity", ["tx_next_velocity", "tx_obstacle"], "tx_velocity");
}

function applyDiffusion(n) {
    executeShader("diverge", ["tx_velocity"], "tx_divergence"); // calc velocity divergence
    for (let i = 0; i < n; i++) {
        executeShader("jacobi", ["tx_divergence", "tx_pressure"], "tx_next_pressure"); // diffuse velocity
        executeShader("jacobi", ["tx_divergence", "tx_next_pressure"], "tx_pressure"); // diffuse velocity
    }
}

function applyProjection() {
    // compute pressure
    executeShader("obstacle_pressure", ["tx_pressure", "tx_obstacle"], "tx_next_pressure");
    swapTextures("tx_next_pressure", "tx_pressure");

    // subtract pressure gradient
    executeShader("gradient_subtraction", ["tx_velocity", "tx_pressure"], "tx_next_velocity");
    executeShader("obstacle_velocity", ["tx_next_velocity", "tx_obstacle"], "tx_velocity");
}

function advectMaterial() {
    executeShader("advect_material", ["tx_material", "tx_velocity"], "tx_next_material");
    executeShader("render", [view, "tx_obstacle"]);
    swapTextures("tx_next_material", "tx_material");
}

// reset functions
function resetWindow() {
    resetTextures();
}

function resetTextures() {
    resetTexture("tx_velocity", gridWidth, gridHeight); // velocity
    resetFrameBufferForTexture("tx_velocity");
    executeShader("reset_velocity", [], "tx_velocity");

    resetTexture("tx_next_velocity", gridWidth, gridHeight); // velocity
    resetFrameBufferForTexture("tx_next_velocity");
    executeShader("reset_velocity", [], "tx_next_velocity");

    resetTexture("tx_divergence", gridWidth, gridHeight);
    resetFrameBufferForTexture("tx_divergence");

    resetTexture("tx_pressure", gridWidth, gridHeight);
    resetFrameBufferForTexture("tx_pressure");

    resetTexture("tx_next_pressure", gridWidth, gridHeight);
    resetFrameBufferForTexture("tx_next_pressure");

    resetTexture("tx_material", actualWidth, actualHeight); // material
    resetFrameBufferForTexture("tx_material");

    resetTexture("tx_next_material", actualWidth, actualHeight); // material
    resetFrameBufferForTexture("tx_next_material");
}

// HTML listener functions


function materialView() {
    view = "tx_material";
    updateUniformForProgram("render", "u_textureSize", [actualWidth, actualHeight], "2f");
    updateToggleButtons('material');
}

function velocityView() {
    view = "tx_velocity";
    updateUniformForProgram("render", "u_textureSize", [gridWidth, gridHeight], "2f");
    updateToggleButtons('velocity');
}

function pressureView() {
    view = "tx_pressure";
    updateUniformForProgram("render", "u_textureSize", [gridWidth, gridHeight], "2f");
    updateToggleButtons('pressure');
    
    // Pre-compute pressure field for immediate display
    // Run extra pressure iterations to build up the field quickly
    for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
        setSize(gridWidth, gridHeight);
        executeShader("diverge", ["tx_velocity"], "tx_divergence");
        executeShader("jacobi", ["tx_divergence", "tx_pressure"], "tx_next_pressure");
        executeShader("jacobi", ["tx_divergence", "tx_next_pressure"], "tx_pressure");
        executeShader("obstacle_pressure", ["tx_pressure", "tx_obstacle"], "tx_next_pressure");
        swapTextures("tx_next_pressure", "tx_pressure");
    }
}

// Update toggle button active states
function updateToggleButtons(activeView) {
    const buttons = document.querySelectorAll('.glass-toggle-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === activeView) {
            btn.classList.add('active');
        }
    });
}

// Custom 3D Card Tilt Effects - Option 1: Custom mouse tracking
function initCardTiltEffects() {
    const cards = document.querySelectorAll('.newsletter-card');
    
    cards.forEach(card => {
        let isHovering = false;
        let animationId = null;
        
                 // Get card boundaries with padding buffer for edge tolerance
         function getCardBounds() {
             const rect = card.getBoundingClientRect();
             const buffer = 10; // 10px buffer around card edges
            return {
                left: rect.left - buffer,
                right: rect.right + buffer,
                top: rect.top - buffer,
                bottom: rect.bottom + buffer,
                width: rect.width + (buffer * 2),
                height: rect.height + (buffer * 2),
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2
            };
        }
        
                 // Calculate tilt values based on mouse position
         function calculateTilt(mouseX, mouseY, bounds) {
             const x = (mouseX - bounds.centerX) / (bounds.width / 2);
             const y = (mouseY - bounds.centerY) / (bounds.height / 2);
             
             // Clamp values to prevent extreme tilts
             const clampedX = Math.max(-1, Math.min(1, x));
             const clampedY = Math.max(-1, Math.min(1, y));
             
             // Calculate tilt angles (reversed for press-down effect)
             const tiltX = -clampedY * 4; // reversed - cursor area drops
             const tiltY = clampedX * 4;  // reversed - cursor area drops
             
             return { tiltX, tiltY };
         }
        
        // Apply tilt transform
        function applyTilt(tiltX, tiltY) {
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            card.style.transition = 'transform 0.1s ease-out';
        }
        
        // Reset card to neutral position
        function resetCard() {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            card.style.transition = 'transform 0.3s ease-out';
        }
        
        // Check if mouse is within card bounds (including buffer)
        function isMouseInBounds(mouseX, mouseY, bounds) {
            return mouseX >= bounds.left && 
                   mouseX <= bounds.right && 
                   mouseY >= bounds.top && 
                   mouseY <= bounds.bottom;
        }
        
        // Global mouse move handler
        function handleMouseMove(e) {
            const bounds = getCardBounds();
            const mouseInBounds = isMouseInBounds(e.clientX, e.clientY, bounds);
            
                         if (mouseInBounds && !isHovering) {
                 // Mouse entered card area
                 isHovering = true;
                 card.style.willChange = 'transform';
                 card.classList.add('custom-hover'); // Add custom hover class
             } else if (!mouseInBounds && isHovering) {
                 // Mouse left card area
                 isHovering = false;
                 card.style.willChange = 'auto';
                 card.classList.remove('custom-hover'); // Remove custom hover class
                 resetCard();
                 return;
             }
            
            if (isHovering) {
                // Update tilt based on mouse position
                const { tiltX, tiltY } = calculateTilt(e.clientX, e.clientY, bounds);
                
                // Use requestAnimationFrame for smooth updates
                if (animationId) cancelAnimationFrame(animationId);
                animationId = requestAnimationFrame(() => {
                    applyTilt(tiltX, tiltY);
                });
            }
        }
        
        // Add global mouse move listener
        document.addEventListener('mousemove', handleMouseMove);
        
        // Cleanup function (if needed)
        card.customTiltCleanup = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            if (animationId) cancelAnimationFrame(animationId);
        };
    });
}

// program entry-point
window.onload = function() {
    init();
    initCardTiltEffects();
};

// Add resize event listener to handle viewport changes
window.addEventListener('resize', function() {
    updateCanvasSize();
    
    // Update WebGL viewport
    if (gl) {
        gl.viewport(0, 0, actualWidth, actualHeight);
        
        // Update shader uniforms with new dimensions
        updateUniformForProgram("render", "u_screenSize", [actualWidth, actualHeight], "2f");
        updateUniformForProgram("advect_material", "u_screenSize", [actualWidth, actualHeight], "2f");
        
        // Reset textures with new dimensions
        resetWindow();
    }
});
