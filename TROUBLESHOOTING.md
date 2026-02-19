# Troubleshooting Guide

## 1. "Generic type 'ModuleWithProviders<T>' requires 1 type argument(s)"
**Cause**: Mismatch between Angular core and CLI versions.
**Fix**: Ensure all `@angular` packages in `package.json` are on the same version (e.g., `^17.0.0`). Run:
```bash
npm update
```

## 2. "Property 'update' does not exist on type 'Particle'"
**Cause**: TypeScript interface mismatch.
**Fix**: Ensure the `Particle` interface in `rangoli-canvas.component.ts` matches the `P5Particle` class implementation.
```typescript
interface Particle {
  update(anchors: any[], gravity: number, speed: number): void;
  // ...
}
```

## 3. Canvas is blank / Black screen
**Cause**: p5 instance not strictly typed or sizing issue.
**Fix**: 
- Check `rangoli-canvas.component.scss` has `:host { display: block; height: 100vh; }`.
- Ensure `p.createCanvas` uses `p.windowWidth` and `p.windowHeight`.

## 4. "Cannot find module 'p5'"
**Cause**: Missing types or library.
**Fix**:
```bash
npm install p5 @types/p5 --save
```
And ensure `tsconfig.app.json` includes "types": ["p5"] if needed (usually auto-detected).

## 5. Deployment shows 404 on assets
**Cause**: Incorrect `baseHref`.
**Fix**: In `angular.json`, set `"baseHref": "/shilpaRangoli-app/"` (or your repo name) under `architect > build > options`.
