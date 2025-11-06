# Pull Request

## 📋 Description

Please include a summary of the changes and the related issue. Include relevant motivation and context.

Fixes # (issue)

## 🔄 Type of Change

Please delete options that are not relevant.

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI update (no functional changes)
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test addition/update
- [ ] 🔧 Configuration change
- [ ] 🚀 Deployment related

## 🧪 How Has This Been Tested?

Please describe the tests that you ran to verify your changes. Provide instructions so we can reproduce.

- [ ] Manual testing in browser
- [ ] Manual testing in desktop app
- [ ] Tested RAG functionality (`pnpm cli test`)
- [ ] Checked responsive design (mobile/tablet/desktop)
- [ ] Tested error cases
- [ ] Verified database operations
- [ ] Checked system status (`pnpm cli status`)

**Test Configuration:**
- OS: [e.g., Windows 11, macOS 13]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 20.11.0]
- pnpm version: [e.g., 8.15.1]

## 📸 Screenshots (if applicable)

### Before
[Add before screenshots here]

### After
[Add after screenshots here]

## ✅ Checklist

Please check all that apply:

### Code Quality
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My code has proper TypeScript types (no `any` types)
- [ ] I have followed React best practices

### Documentation
- [ ] I have made corresponding changes to the documentation
- [ ] I have updated the README if needed
- [ ] I have added JSDoc comments for new functions
- [ ] I have updated the API documentation if applicable

### Testing
- [ ] My changes generate no new warnings or errors
- [ ] I have tested the changes thoroughly
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I ran `pnpm lint` and it passed
- [ ] I ran `pnpm build` and it succeeded

### Database
- [ ] I have created/updated database migrations if needed
- [ ] I have tested database queries
- [ ] Row Level Security (RLS) policies are in place
- [ ] I have updated the seed scripts if needed

### RAG/AI Features
- [ ] I have tested RAG search functionality
- [ ] I have verified embeddings are generated correctly
- [ ] I have tested AI model responses
- [ ] I have handled API errors gracefully

### Security
- [ ] I have not exposed any sensitive information (API keys, passwords, etc.)
- [ ] I have properly sanitized user inputs
- [ ] I have followed security best practices
- [ ] I have not introduced any SQL injection vulnerabilities

### Desktop App
- [ ] I have tested the Tauri desktop app if changes affect it
- [ ] I have tested the installer if changes affect it
- [ ] I have verified offline functionality if applicable

## 📝 Additional Notes

Add any additional notes, concerns, or questions here.

## 🔗 Related Issues/PRs

List any related issues or pull requests:
- Related to #issue_number
- Depends on #pr_number
- Blocks #issue_number

## 👀 Reviewers

Tag specific people if you need their review:
@username

---

## For Reviewers

### Review Checklist

- [ ] Code follows project conventions
- [ ] Changes are well-documented
- [ ] No obvious bugs or issues
- [ ] Performance impact is acceptable
- [ ] Security implications are addressed
- [ ] Tests are adequate
- [ ] UI/UX changes are polished
- [ ] Database changes are properly migrated
- [ ] RAG features work as expected

