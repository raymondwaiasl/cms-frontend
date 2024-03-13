import { useParams } from 'react-router-dom';

const DashboardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <div></div>;
};

export default DashboardDetailPage;
