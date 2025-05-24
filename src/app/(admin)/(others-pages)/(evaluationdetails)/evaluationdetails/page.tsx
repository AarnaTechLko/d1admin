import { Suspense } from 'react';
import EvaluationDetails from './EvaluationDetails';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EvaluationDetails />
    </Suspense>
  );
}
