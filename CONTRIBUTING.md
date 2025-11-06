# Contributing to FIRM AI

First off, thank you for considering contributing to FIRM AI! 🎉

We welcome contributions from the community. Whether it's a bug report, new feature, correction, or additional documentation, we greatly appreciate any help!

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by respect, professionalism, and inclusivity. Please be kind and respectful to fellow contributors.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Git
- Supabase account (for testing)
- OpenRouter API key (for testing AI features)

### Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/firmai.git
cd firmai

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/firmai.git
```

---

## 💻 Development Setup

1. **Install dependencies:**

```bash
pnpm install
```

2. **Configure environment:**

```bash
cp .env.example .env.local
# Fill in your Supabase and OpenRouter credentials
```

3. **Run database setup:**

```bash
pnpm setup
```

4. **Start development server:**

```bash
pnpm dev
```

5. **Verify everything works:**

```bash
pnpm cli status
```

---

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected vs actual** behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, etc.)

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g., Windows 11]
 - Browser: [e.g., Chrome 120]
 - Version: [e.g., 0.1.0]
```

### Suggesting Features

Feature requests are welcome! Please:

1. Check if the feature has already been suggested
2. Provide a clear use case
3. Explain why this feature would be useful
4. Consider implementation details

### Code Contributions

We love code contributions! Here's how:

1. **Find an issue** to work on or create a new one
2. **Comment** on the issue to claim it
3. **Create a branch** from `main`
4. **Make your changes** following our guidelines
5. **Test thoroughly**
6. **Submit a pull request**

---

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow TypeScript best practices
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
pnpm lint

# Build the project
pnpm build

# Test RAG functionality
pnpm cli test "test query"

# Check system status
pnpm cli status
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git commit -m "feat: add flashcard review mode"
git commit -m "fix: resolve RAG search pagination issue"
git commit -m "docs: update API documentation"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/amazing-feature
```

Then create a Pull Request on GitHub with:

- **Clear title** describing the change
- **Description** of what and why
- **Screenshots** for UI changes
- **Link to related issue** (if applicable)
- **Testing steps** for reviewers

---

## 📝 Coding Guidelines

### TypeScript

- Use **strict mode**
- Define proper **types and interfaces**
- Avoid `any` type (use `unknown` if needed)
- Use **type inference** where appropriate

```typescript
// Good
interface CaseData {
  id: string;
  title: string;
  content: string;
}

function processCase(caseData: CaseData): string {
  return caseData.title;
}

// Bad
function processCase(caseData: any) {
  return caseData.title;
}
```

### React Components

- Use **functional components** with hooks
- Keep components **small and focused**
- Extract **reusable logic** into custom hooks
- Use **proper TypeScript types** for props

```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {children}
    </button>
  );
}
```

### Styling

- Use **Tailwind CSS** for styling
- Follow **mobile-first** approach
- Use **shadcn/ui components** when available
- Maintain **consistent spacing** (use theme values)

```tsx
// Good
<div className="flex flex-col gap-4 p-6 md:flex-row md:p-8">
  <Card>...</Card>
</div>
```

### API Routes

- Add **proper error handling**
- Validate **input data**
- Use **try-catch** blocks
- Return **consistent response formats**

```typescript
// Good
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }
    
    const results = await searchRAG(query);
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Database Queries

- Use **parameterized queries**
- Implement **Row Level Security (RLS)**
- Handle **errors gracefully**
- Use **transactions** for multi-step operations

---

## 🧪 Testing

### Manual Testing

Before submitting:

1. **Test the feature** in your browser
2. **Check responsive design** (mobile/tablet/desktop)
3. **Test error cases** (invalid input, network errors)
4. **Verify database operations** work correctly
5. **Test RAG features** if applicable

### RAG Testing

```bash
# Test RAG search
pnpm cli test "contract law"

# Check database stats
pnpm cli status

# Verify embeddings
pnpm cli migrate
```

### Desktop App Testing

```bash
# Test Tauri app
pnpm tauri dev

# Build and test installer
pnpm tauri build
```

---

## 📚 Documentation

### Code Documentation

- Add **JSDoc comments** for functions
- Document **complex algorithms**
- Explain **non-obvious decisions**

```typescript
/**
 * Generates IRAC analysis from case text using RAG-enhanced context.
 * 
 * @param caseText - The full text of the legal case
 * @param caseTitle - Title of the case for reference
 * @param options - Optional configuration (user ID, case IDs)
 * @returns Promise resolving to IRAC analysis object
 * @throws Error if OpenRouter API fails or RAG search returns no results
 */
export async function generateIRAC(
  caseText: string,
  caseTitle: string,
  options?: { userId?: string; caseIds?: string[] }
): Promise<IRAAnalysis> {
  // Implementation...
}
```

### README Updates

If your change affects:
- Installation steps
- API endpoints
- Configuration
- Features

Please update the README accordingly!

---

## 🎯 Areas We Need Help

### High Priority

- 🐛 Bug fixes and error handling improvements
- 📖 Documentation improvements
- ♿ Accessibility enhancements
- 🎨 UI/UX improvements
- 🧪 Test coverage

### Features We'd Love

- 📱 Mobile app (React Native)
- 🌍 Internationalization (i18n)
- 📊 Advanced analytics dashboard
- 🎤 Audio transcription for lectures
- 📝 Citation generator (Bluebook format)
- 🤝 Collaborative study features
- 🔄 Auto-update system for desktop app

---

## 💬 Questions?

- **Check existing issues** and discussions first
- **Ask in Discussions** for general questions
- **Create an issue** for bug reports or feature requests
- **Join our Discord** (coming soon!)

---

## 🙏 Thank You!

Every contribution helps make FIRM AI better for law students everywhere. We appreciate your time and effort! ❤️

---

<div align="center">

**Happy Coding! 🚀**

[⬆ Back to Top](#contributing-to-firm-ai)

</div>

