import { StoreLayout } from '../../layouts';

export default function StoreLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreLayout>{children}</StoreLayout>;
}
