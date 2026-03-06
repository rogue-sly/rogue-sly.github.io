# Project Roadmap & TODOs

## Track 1: UI & UX Enhancements (Features)

This track focuses on improving the user interface, settings management, and adding new features to the site.

### Settings & Configuration

- [x] **Settings Store**
    - [x] Create `src/lib/stores/settings.svelte.ts`.
    - [x] Implement reactive store for preferences (`visualizerEnabled`, `lowQualityMode`).
    - [x] Persist settings to `localStorage`.
- [x] **Dedicated Settings Page**
    - [x] Create `/settings` route.
    - [x] Add toggles for Visualizer and Low Quality Mode.

### Player Experience

- [x] **Improved Player UI**
    - [x] Add Volume Slider.
    - [x] Add Settings Link.
    - [x] Improve feedback (play/pause, buffering states).
- [x] **Integration**
    - [x] Update `Visualizer.svelte` to respect `visualizerEnabled` setting.

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
