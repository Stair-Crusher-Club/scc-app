# Project-Specific Rules for Claude Code

## Required Post-Work Validation

After any code changes or implementation work, **ALWAYS** run these validation commands and fix all issues:

1. **ESLint Check**: `yarn lint`
   - Fix all linting errors and warnings
   - Repeat until 0 warnings/errors

2. **TypeScript Check**: `yarn tsc --noEmit`
   - Fix all type errors
   - Repeat until 0 type errors

**No task is complete until both commands pass with zero issues.**

## Project Context

- React Native application with TypeScript
- Uses ESLint for code quality
- Uses custom SccXxx components for event logging
- Implements global event logging registry for duplicate detection

## Component Guidelines

### SccXxx Components
- All touchable components must use SccXxx variants (SccPressable, SccTouchableOpacity, etc.)
- Required `elementName` prop for event logging
- Optional `logParams` for additional logging parameters
- Optional `disableLogging` prop to completely disable event logging
- Automatic duplicate element detection via global registry

### Event Logging
- `element_view` logged on component mount
- `element_click` logged on press events
- Global registry prevents duplicate elements with same elementName+params