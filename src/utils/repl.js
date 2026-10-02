// Evaluates code typed into the panel's JavaScript input, in global scope.
export async function evaluate(code) {
  const src = code.trim();
  const run = (s) => (0, eval)(s); // indirect eval: global scope

  try {
    let value;
    // "{a: 1}" should be an object literal, not a block
    if (/^\{[\s\S]*\}$/.test(src)) {
      try {
        value = run(`(${src})`);
      } catch (e) {
        if (!(e instanceof SyntaxError)) throw e;
        value = run(src);
      }
    } else {
      value = run(src);
    }
    if (value && typeof value.then === "function") {
      return { value: await value, awaited: true };
    }
    return { value };
  } catch (error) {
    if (error instanceof EvalError || /unsafe-eval|Content Security Policy/i.test(String(error && error.message))) {
      return { error: new Error("This page's Content Security Policy blocks evaluating JavaScript") };
    }
    return { error };
  }
}
