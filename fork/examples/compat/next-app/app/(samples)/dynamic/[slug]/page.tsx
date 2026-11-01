import Samples from "../../../../components/Samples";
export const dynamic = "force-dynamic";
export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <p data-dynamic-slug>{slug}</p>
      <Samples />
    </>
  );
}
