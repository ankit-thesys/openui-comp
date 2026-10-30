import { css, keyframes } from "@openuidev/react-components";
const appear = keyframes`from { opacity: 0.5; } to { opacity: 1; }`;
const card = css`
  background-color: rgb(17, 34, 51);
  padding: 19px;
  animation: ${appear} 1ms linear;
`;
export default function LazyCard() {
  return (
    <div data-browser-only className={card}>
      Browser-only rule
    </div>
  );
}
