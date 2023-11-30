import React, { ReactElement } from "react";
import useResizeObserver from "use-resize-observer";

type Props = {
  headerHeight: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  children: (dimens: { width: number; height: number }) => ReactElement;
};

export const FillFlexParent = React.forwardRef(function FillFlexParent(
  props: Props,
  forwardRef
) {
  const { ref, width, height } = useResizeObserver();
  const headerHeight = props.headerHeight === 0 ? 0 : Math.ceil(props.headerHeight + 1);
  const style = {
    flex: 1,
    width: "100%",
    height: `calc(100% - ${headerHeight}px)`,
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden"
  };
  return (
    <div style={style} ref={mergeRefs(ref, forwardRef)} onKeyDown={props.onKeyDown}>
      {width && height ? props.children({ width, height }) : null}
    </div>
  );
});

type AnyRef = React.MutableRefObject<any> | React.RefCallback<any> | null;

function mergeRefs(...refs: AnyRef[]) {
  return (instance: any) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref != null) {
        ref.current = instance;
      }
    });
  };
}