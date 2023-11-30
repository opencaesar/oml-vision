import { cloneDeep } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TreeModel from "tree-model-improved";
import ITableData from "../../interfaces/ITableData";

function findById(node: any, id: string): TreeModel.Node<any> | null {
  return node.first((n: any) => n.model.id === id);
}

export const useVisionTree = (initialData: ITableData[]) => {
  const model = useRef<TreeModel | null>(null);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData])

  if (!model.current) {
    model.current = new TreeModel();
  }

  const root = useMemo(() => {
    return model.current?.parse(cloneDeep({ "name": "Vision Tree", children: data }));
  }, [data]);

  const find = useCallback((id: string) => findById(root, id), [root]);

  const updateData = () => {
    if (root) {
      setData(root.model.children);
    }
  };

  const update = () => {
    updateData();
  };

  return {
    data,
    onToggle: (id: string, isOpen: boolean) => {
      const node = find(id);
      if (node && !node.model?.content) {
        node.model.isOpen = isOpen;
        update();
      }
    },
    onMove: ({
      dragIds: srcIds,
      parentId: dstParentId,
      index: dstIndex,
    }: {
      dragIds: string[];
      parentId: string | null;
      index: number;
    }) => {
      for (const srcId of srcIds) {
        const src = find(srcId);
        const dstParent = dstParentId ? find(dstParentId) : root;
        if (!src || !dstParent) return;

        const newItem = model.current?.parse(src.model);
        if (!newItem) return;

        dstParent.addChildAtIndex(newItem, dstIndex);

        src.drop();
      }
      update();
    }
  };
};