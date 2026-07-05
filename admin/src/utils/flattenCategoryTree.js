/**
 * Flattens a nested category tree into a single list with a `depth` property,
 * suitable for rendering an indented <select>. Optionally excludes a given
 * category id and all of its descendants (used to prevent selecting a
 * category as its own parent, or as a descendant of itself, when editing).
 */
export const flattenCategoryTree = (nodes, excludeId = null, depth = 0) => {
  return nodes.reduce((acc, node) => {
    if (excludeId && String(node._id) === String(excludeId)) {
      return acc;
    }

    acc.push({
      _id: node._id,
      name: node.name,
      depth,
      isActive: node.isActive,
    });

    if (node.children?.length) {
      acc.push(...flattenCategoryTree(node.children, excludeId, depth + 1));
    }

    return acc;
  }, []);
};
