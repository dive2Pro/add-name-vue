module.exports = function(str) {
  const obj = {
    template: "",
    script: "",
    styles: ""
  };
  const max = str.length;
  let index = 0;

  while (index <= max) {
    const templateStart = str.indexOf("<template");
    const templateEnd = findEndTemplate(str, templateStart);
    obj.template = str.slice(templateStart, templateEnd + 1);

    break;
  }
  return obj;
};

function findEndTemplate(origin, index) {
  let str = origin.slice(index);
  let next = 0;
  let end = index;
  const endTemplate = "</template>";
  while (next != -1) {
    next = str.indexOf(endTemplate);
    if (next == -1) {
      end += next;
    } else {
      end += next + endTemplate.length;
    }
    str = origin.slice(end);
  }
  return end;
}
