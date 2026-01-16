

export default async function ExpertPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  return (
    <div>
      <h1>Expert user name</h1>
      <p>Expert ID: { id}</p>
    </div>
  );
}