# Formagen

A modern form builder for creating, managing, and submitting dynamic forms. Built for teams that need flexible, evolving forms with multi-step support, drag-and-drop editing, and rich text labels.

[Live Demo](https://formagen-fda9dsbhg4h4gqft.australiaeast-01.azurewebsites.net/play)

## Fields

- **Text** - Short and long text inputs
- **Number** - With min/max, step, and decimal options
- **Date** - With optional past/future restrictions
- **Checkbox** - Single or multi-select
- **Radio** - Single-select option groups
- **Combobox** - Searchable dropdown (single or multi-select)
- **Signature** - Canvas-based signature capture

## Features

- Drag-and-drop field ordering
- Multi-step forms with step validation and navigation
- Rich text editor for field labels and descriptions
- Field properties panel (placeholder, description, required, default values)
- Form preview, designer, and submission modes
- Dashboard with forms and responses management
- Authentication and admin user management
- OTP-based access for form submissions

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Forms & Validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Drag & Drop | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) |
| Rich Text Editor | [Tiptap](https://tiptap.dev/) |
| Data Tables | [TanStack Table](https://tanstack.com/table) |
| Database | Cosmos DB (NoSQL API) |
| API | ASP.NET Core Web API - [Repository](https://github.com/Santiagosala2/formagenAPI) |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Project Structure

```
app/
  play/         # Public playground / demo
  access/       # OTP-based form access
  submit/       # Form submission page
  build/        # Form builder (designer mode)
  dashboard/    # Dashboard (forms, responses, admin)
components/
  fields/       # Field components (text, date, checkbox, etc.)
  formBuilder/  # Core form builder logic and panels
  editors/      # Tiptap rich text editors
  steps/        # Multi-step form container
  ui/           # shadcn/ui primitives
services/       # API service layer
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
