# InkFlow AI

InkFlow turns a phone into a live writing and drawing surface for a laptop. Pair the devices with a QR code, write or sketch on the phone, and watch the strokes appear instantly in the desktop workspace.

**Live application:** [https://inkflow-ai.in/](https://inkflow-ai.in/)

Notes can be converted into editable text, imported from images or text files, saved locally, and downloaded. Sketches can be drawn from either device, polished locally, or transformed into a detailed image through Pixazo.

## Highlights

- Live phone-to-laptop ink synchronization with Socket.IO
- Laptop mouse, trackpad, touch, and phone drawing support
- Separate Notes and Sketch Studio workspaces
- OCR.space handwriting recognition with clear quota and key errors
- Local Tesseract OCR fallback for uploaded images
- TXT and image import directly into notes
- Local note and canvas persistence with downloadable exports
- Local, private sketch polish
- Pixazo sketch-to-image generation with a scene-description prompt
- Optional Pollinations preprocessing stage
- Visible image-generation progress instead of an indefinite loading state
- Responsive phone interface and light/dark themes

## How it works

```text
Phone writer ──Socket.IO──▶ Custom Node server ──▶ Laptop canvas
                                                    │
Notes:  canvas/upload ──Tesseract + OCR.space───────┤──▶ editable text
Sketch: raw canvas ──local cleanup──Pixazo──────────┘──▶ generated image
```

The custom Node server runs Next.js and Socket.IO on the same port. Devices join an isolated session identified by the pairing URL. Notes, sketches, and generated images are stored in the laptop browser's local storage; no database is required.

## Requirements

- Node.js 22 recommended
- Corepack and Yarn 4
- A modern browser with Canvas, WebSocket, and local-storage support
- An OCR.space key for cloud handwriting recognition
- A Pixazo key for AI sketch generation

The application still supports drawing, local persistence, downloads, TXT imports, local upload OCR, and local sketch polish when optional cloud services are unavailable.

## Local setup

Clone the repository, enable Corepack, and install dependencies:

```bash
corepack enable
yarn install
```

Create `.env.local` in the project root:

```env
OCR_SPACE_API_KEY="your_ocr_space_key"
PIXAZO_API_KEY="your_pixazo_key"
```

Start the custom development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000), or use the hosted application at [inkflow-ai.in](https://inkflow-ai.in/).

To pair a phone, select **Connect phone**, scan the QR code, and open the generated URL on the phone. When testing across physical devices, both devices must be able to reach the hostname shown in the pairing URL. A public deployment is usually easier than `localhost` for phone testing.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OCR_SPACE_API_KEY` | For cloud OCR | OCR.space Engine 3 handwriting recognition |
| `PIXAZO_API_KEY` | For AI images | Server-side Pixazo authentication |
| `PIXAZO_IMAGE_ENDPOINT` | No | Overrides the default Pixazo image endpoint |
| `ENABLE_POLLINATIONS_STAGE` | No | Set to `true` to run Pollinations before Pixazo |
| `POLLINATIONS_API_KEY` | Only when enabled | Server-side Pollinations key |
| `POLLINATIONS_IMAGE_MODEL` | No | Pollinations image model; defaults to `kontext` |
| `HOST` | No | Server host; defaults to `0.0.0.0` |
| `PORT` | No | Server port; defaults to `3000` |

Never prefix service secrets with `NEXT_PUBLIC_`, expose them in browser code, or commit `.env.local`.

### Optional Pollinations stage

Pollinations is disabled by default because image models consume Pollen balance. To enable it explicitly:

```env
ENABLE_POLLINATIONS_STAGE="true"
POLLINATIONS_API_KEY="sk_your_server_key"
POLLINATIONS_IMAGE_MODEL="kontext"
```

The default and recommended pipeline is:

```text
Local cleanup → Pixazo
```

## Using InkFlow

### Notes

1. Open **Notes** and connect a phone, or select **Upload**.
2. Write on the phone or import a TXT/image file.
3. Convert handwriting into editable text.
4. Edit the title and note content on the laptop.
5. Download the note when finished.

Uploaded images are read locally with Tesseract first. OCR.space is then used when configured and available; the local result remains the fallback if the request fails or its quota is exhausted.

### Sketch Studio

1. Draw on the laptop canvas or a connected phone.
2. Choose a desktop ink color as needed.
3. Select **Polish locally** for a private browser-only cleanup.
4. Select **Enhance with AI** to open the image-generation modal.
5. Describe the scene—for example, `A small house beside a tree under the sun`.
6. Follow the Local cleanup → Pixazo progress indicator.
7. Close the completed modal to place the generated image on the canvas, or download it directly.

The scene description matters: basic diffusion models cannot always infer the meaning of primitive shapes without text guidance.

## Available commands

```bash
yarn dev      # Start Next.js and Socket.IO in development
yarn lint     # Run ESLint
yarn build    # Create a production build
yarn start    # Start the production custom server
```

Run both lint and the production build before deploying:

```bash
yarn lint
yarn build
```

## Project structure

```text
app/
├── _components/                 Workspace, sidebar, notes, and sketch UI
├── _lib/                        Canvas preparation and Socket.IO client
├── api/
│   ├── enhance-sketch/route.ts  Pixazo/Pollinations image pipeline
│   ├── health/route.ts          Deployment health check
│   └── recognize-handwriting/   OCR.space integration
├── write/page.tsx               Paired phone writing interface
├── inkflow-workspace.tsx        Main workspace state and synchronization
└── globals.css                  Responsive light/dark presentation
server.mjs                       Next.js + Socket.IO custom server
render.yaml                      Render Blueprint deployment
```

## Deployment on Render

The included `render.yaml` defines the Socket.IO-compatible Node service.

1. Push the repository to GitHub.
2. In Render, select **New → Blueprint**.
3. Connect the repository and apply the detected Blueprint.
4. Add `OCR_SPACE_API_KEY` and `PIXAZO_API_KEY` in the Render service environment.
5. Deploy and open the generated `onrender.com` URL.

Render builds with Yarn, starts `server.mjs`, and checks `/api/health`. Because phone synchronization requires a persistent WebSocket-capable server, deploy the custom Node server rather than treating the app as a static export.

## Troubleshooting

### The phone does not connect

- Confirm that both devices opened the same pairing session.
- Do not use a laptop-only `localhost` URL from a physical phone.
- Confirm that the deployment supports WebSockets.
- Refresh the pairing modal to create a new session if the previous link was copied incorrectly.

### OCR does not return text

- Confirm `OCR_SPACE_API_KEY` is set and restart the server.
- Keep cloud OCR images below the 1 MB free-plan limit enforced by the route.
- Write with clear spacing and strong contrast.
- For uploaded images, InkFlow automatically retains the local Tesseract result when OCR.space is unavailable.

### Pixazo generation fails

- Confirm `PIXAZO_API_KEY` is present and belongs to an active Pixazo account.
- Restart the server after changing `.env.local`.
- Check the Pixazo dashboard for request limits or balance errors.
- Provide a concise scene description in the generation modal.
- Use `PIXAZO_IMAGE_ENDPOINT` only when the replacement endpoint accepts the request fields used by InkFlow.

### Pollinations reports insufficient balance

Leave `ENABLE_POLLINATIONS_STAGE` unset or set it to `false`. Pollinations is optional and the default Pixazo pipeline does not require it.

## Privacy and storage

- Local polish runs entirely in the browser.
- Notes, sketch data, and generated-image state are saved in browser local storage.
- Cloud OCR sends the prepared image to OCR.space only when recognition is requested.
- AI sketch generation sends the cleaned sketch, mask, and scene description to the configured image provider.
- Clearing browser site data removes locally saved InkFlow content.

InkFlow currently has no user account database or automatic cloud backup. Download important notes and images before clearing browser data or changing browsers.
