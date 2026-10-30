import type { GetServerSideProps } from "next";
import Samples from "../../components/Samples";
export const getServerSideProps: GetServerSideProps<{ slug: string }> = async ({ params }) => ({
  props: { slug: String(params?.slug) },
});
export default function DynamicPage({ slug }: { slug: string }) {
  return (
    <>
      <p data-dynamic-slug>{slug}</p>
      <Samples />
    </>
  );
}
