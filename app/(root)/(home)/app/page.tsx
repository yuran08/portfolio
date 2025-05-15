import Link from "next/link";
import {
  LineItemContainer,
  LineItemHeading,
  LineItemOuterContainer,
  LineItemSubheading,
} from "../line-item";

export default function Page() {
  return (
    <LineItemOuterContainer>
      <LineItemContainer>
        <LineItemHeading>
          <Link href="/chat">𝓎𝓇 𝒸𝒽𝒶𝓉</Link>
        </LineItemHeading>
        <LineItemSubheading>Server-driven markdown parsing</LineItemSubheading>
      </LineItemContainer>
    </LineItemOuterContainer>
  );
}
