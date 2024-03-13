export function list_to_tree(list: any[], parentId: string, childId: string) {
  let map: { [key: string]: any } = {},
    node,
    roots = [],
    i;

  for (i = 0; i < list.length; i += 1) {
    map[list[i][childId]] = i; // initialize the map
    list[i].children = []; // initialize the children
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node[parentId] !== '') {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node[parentId]]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
