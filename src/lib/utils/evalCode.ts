export async function evalCode(code: string) {
  return new Promise<any>((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(code, (result, exp) => {
      if (exp && exp.isError) {
        reject(exp)
      } else {
        resolve(result)
      }
    })
  })
}
