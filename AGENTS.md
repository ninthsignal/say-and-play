# Important Memories

- Workspace context: `/mnt/c/Users/danny/Documents/say-and-play`; sandbox mode `danger-full-access`, network enabled, approval policy `never`.
- New project brief: kids learning web app built with Next.js, ShadCN UI, Three.js, react-spring animations, multitouch controls, and speech recognition. Target deployment: GitHub Pages (static export).
- Landing flow: splash screen shows logo + “Open Seseme” text; speech gate requiring phrase “Open Sesame” with adjustable strictness; tapping the logo plays an audio prompt (“Say Open Seseme”).
- Game 1 concept: four 3D gift boxes (Three.js). Commands such as “open the red box/first box/polka dot box” trigger matching animations; each phrase has a tappable speaker icon that plays its audio clip. Boxes can be reordered via single-finger drag, and two-finger gesture rotates a box; use react-spring for animations.
- Game 2 concept: swipeable loop of numbered scenes, similar to provided drag example; gesture navigation (swipe/drag) replaces clicks. Example scene: half-full juice glass with prompt “Can I have more juice?”; audio tap plays prompt; on correct speech, old image scales down and full glass springs in. Duplicate this scene twice for now; component should accept text label and audio filename.
- Assets: user will supply audio clips (include placeholder paths and components ready to load `audio/<file>`). Future scenes to be provided later.
