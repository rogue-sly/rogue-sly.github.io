# Project Roadmap & TODOs

## Track 1: Rust/Wasm Visualizer (Core Tech)

This track focuses on replacing the current HTML5 Canvas 2D visualizer with a high-performance Rust + `wgpu` implementation compiled to WebAssembly.

### Phase 1: Setup & Configuration

- [ ] **Install Prerequisites**
  - [ ] Install `wasm-bindgen-cli`: `cargo install -f wasm-bindgen-cli`
  - [ ] Add `wasm32-unknown-unknown` target: `rustup target add wasm32-unknown-unknown`
- [ ] **Initialize Rust Crate**
  - [ ] Create `src/lib/rust-visualizer` (or similar path) via `cargo new --lib`.
  - [ ] Configure `Cargo.toml`:
    - [ ] Set `crate-type = ["cdylib"]`.
    - [ ] Add dependencies: `wgpu`, `wasm-bindgen`, `winit` (if needed), `bytemuck`.
- [ ] **Build Script**
  - [ ] Create a build script (e.g., `scripts/build-wasm.sh`) to run:
    - `cargo build --target wasm32-unknown-unknown --release`
    - `wasm-bindgen --out-dir src/lib/generated --target web target/wasm32-unknown-unknown/release/visualizer.wasm`
- [ ] **Vite Integration**
  - [ ] Install `vite-plugin-wasm` and `vite-plugin-top-level-await`.
  - [ ] Update `vite.config.ts` to include these plugins.

### Phase 2: Rust Implementation

- [ ] **State Management**
  - [ ] Create `VisualizerState` struct holding `wgpu::Device`, `Queue`, `Surface`, `RenderPipeline`.
- [ ] **Shaders (WGSL)**
  - [ ] Write vertex/fragment shaders for the retro grid.
  - [ ] Write shaders for the spectrum bars.
- [ ] **Data Binding**
  - [ ] Create Uniform Buffer for audio frequency data (`[u8; 256]` or similar).
  - [ ] Expose `update_audio_data` function via `wasm-bindgen`.
- [ ] **Render Loop**
  - [ ] Expose `render` function to JS.
  - [ ] Implement resize handling.

### Phase 3: Svelte Integration

- [ ] **Load Wasm Module**
  - [ ] Update `src/lib/components/Visualizer.svelte`.
  - [ ] Import Wasm module asynchronously (`onMount` / `$effect`).
- [ ] **Canvas Handover**
  - [ ] Pass `<canvas>` element to Rust initialization.
- [ ] **Animation Loop**
  - [ ] Replace 2D context calls with `rust_module.render()` and `rust_module.update_data(audioData)`.

### Phase 4: Polish & Optimization

- [ ] **Performance Tuning**
  - [ ] Check buffer usage.
  - [ ] Ensure proper cleanup in `onDestroy`.
- [ ] **Visual Parity**
  - [ ] Match colors and gradients from original CSS/Canvas version.

---

## Track 2: UI & UX Enhancements (Features)

This track focuses on improving the user interface, settings management, and adding new features to the site.

### Settings & Configuration

- [x] **Settings Store**
  - [x] Create `src/lib/stores/settings.svelte.ts`.
  - [x] Implement reactive store for preferences (`visualizerEnabled`, `audioDrift`, `lowQualityMode`).
  - [x] Persist settings to `localStorage`.
- [x] **Dedicated Settings Page**
  - [x] Create `/settings` route.
  - [x] Add toggles for Visualizer, Audio Drift, and Low Quality Mode.

### Player Experience

- [ ] **Improved Player UI**
  - [ ] Extract player logic to `src/lib/components/Player.svelte`.
  - [ ] Add Volume Slider.
  - [x] Add Settings Link.
  - [ ] Improve feedback (play/pause, buffering states).
- [ ] **Integration**
  - [ ] Update `Visualizer.svelte` to respect `visualizerEnabled` setting.
  - [ ] Update Sidebar to use new `Player` component.

### Future Concepts

- [ ] **Interactive Terminal (Hacker Mode)**
  - [ ] Toggleable CLI overlay (e.g., `~` key).
  - [ ] Commands: `ls`, `cd`, `cat`, `whoami`.
- [ ] **Global Command Palette (Cmd+K)**
  - [ ] Modal search interface.
  - [ ] Fuzzy search for posts, projects, and navigation.
- [ ] **WebGPU Playground / Lab**
  - [ ] Dedicated `/lab` route.
  - [ ] Sandbox for shader experiments and demos.
- [ ] **Guestbook**
  - [ ] Simple message board.
  - [ ] GitHub/OAuth integration.
- [ ] **"Now" Page**
  - [ ] `/now` route for current focus/status updates.
