# Wind Tunnel Simulation & Newsletter Site

An interactive wind tunnel visualization with fluid dynamics simulation, featuring a modern newsletter subscription interface.

## 🌊 Features

### Wind Tunnel Simulation
- **Real-time fluid dynamics** using WebGL shaders
- **Interactive cursor obstacles** that affect wind flow
- **Multiple visualization modes**: Material, Velocity, and Pressure views
- **Responsive canvas** that adapts to viewport size
- **High-performance rendering** with optimized shader programs

### Newsletter Interface
- **Modern glass-effect design** with CSS backdrop filters
- **Mobile-responsive layout** with hamburger navigation
- **Typewriter animations** and scroll-triggered effects
- **Filter functionality** for newsletter cards (Recent, Oldest, A-Z, Z-A)
- **Phoenix timezone display** with real-time updates

## 🚀 Performance Optimizations

This codebase has been optimized for production deployment:

- **Modular architecture** with shared utility files
- **Lazy loading** for below-the-fold images
- **Optimized font loading** (reduced from 7 to 3 font weights)
- **External script caching** (extracted inline JavaScript)
- **Configuration-driven constants** replacing magic numbers
- **Removed unused code** and dead shader fragments
- **~16KB reduction** in bundle size + improved caching

## 📁 Project Structure

```
Wind-Tunnel/
├── assets/                 # Image assets (WebP optimized)
│   ├── logo.webp
│   ├── navlogo.webp
│   ├── footer-01.webp
│   ├── bighero.png
│   └── [view icons].webp
├── lib/                    # Shared utilities
│   ├── GlBoilerplate.js    # WebGL helper functions
│   ├── animations.js       # Scroll animations
│   ├── time-display.js     # Phoenix time display
│   ├── mobile-menu.js      # Mobile navigation
│   ├── newsletters-utils.js # Newsletter functionality
│   ├── email-collection.js # Email collection system
│   └── reader.js           # Newsletter reader functionality
├── wind-tunnel.html        # Main simulation page
├── wind-tunnel.css         # Main page styles
├── wind-tunnel.js          # Simulation logic
├── newsletters.html        # Newsletter listing page
├── newsletters.css         # Newsletter page styles
└── util.js                 # WebGL utilities
```

## 🛠️ Technical Implementation

### WebGL Fluid Simulation
- **Navier-Stokes equations** solved via projection method
- **Bilinear interpolation** for smooth advection
- **Jacobi iteration** for pressure diffusion
- **Dynamic obstacle textures** for interactive elements

### Modern CSS Features
- **CSS Grid & Flexbox** for responsive layouts
- **Backdrop filters** for glass effects
- **CSS transforms** for 3D card animations
- **Custom properties** for consistent theming

### JavaScript Architecture
- **Modular ES5 functions** with clear separation of concerns
- **Event-driven animations** using Intersection Observer
- **Configuration objects** for maintainable constants
- **Optimized event handlers** with proper cleanup

## 🎮 Usage

### Wind Tunnel Simulation
1. **Move your cursor** over the canvas to create obstacles
2. **Click toggle buttons** to switch between visualization modes:
   - **Material**: Shows wind flow patterns
   - **Velocity**: Displays speed vectors
   - **Pressure**: Reveals pressure gradients

### Newsletter Interface
1. **Browse newsletters** with hover effects and animations
2. **Filter content** using the dropdown (Recent, Oldest, A-Z, Z-A)
3. **Navigate responsively** on mobile with hamburger menu
4. **Subscribe** via email input forms

## 🔧 Development

### Browser Requirements
- **WebGL support** for fluid simulation
- **Modern CSS features** (backdrop-filter, CSS Grid)
- **ES5+ JavaScript** compatibility

### Performance Notes
- Canvas automatically **scales resolution** based on viewport
- **Debounced resize events** prevent performance issues
- **Optimized shader programs** for smooth 60fps rendering
- **Efficient DOM manipulation** with minimal reflows

## 📱 Responsive Design

- **Desktop**: Full simulation view with sidebar navigation
- **Tablet**: Optimized layout with floating glass panels
- **Mobile**: Hamburger navigation with fullscreen overlays
- **Touch devices**: Responsive interactions and proper scaling

## 🎨 Design System

- **Typography**: Roboto Mono (300, 400, 500 weights)
- **Colors**: Monochromatic with accent gradients
- **Effects**: Glass morphism with backdrop blur
- **Animations**: Smooth transitions with CSS transforms

## 📄 License

MIT License - feel free to use this code for your own projects!

---

Built with ❤️ using WebGL, modern CSS, and vanilla JavaScript. 