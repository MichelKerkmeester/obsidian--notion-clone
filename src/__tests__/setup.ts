const momentStub = () => undefined;

Object.defineProperty(globalThis, "moment", {
  configurable: true,
  writable: true,
  value: momentStub,
});

export {};
