import { BaseLayout } from '../../layouts';

export default function StoreLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseLayout>{children}</BaseLayout>;
}
