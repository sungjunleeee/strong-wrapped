
import { useWorkoutData } from './hooks/useWorkoutData';
import { Loader2 } from 'lucide-react';
import { StoryContainer } from './components/StoryContainer';
import { IntroSlide } from './components/slides/IntroSlide';
import { StatsSlide } from './components/slides/StatsSlide';
import { TopExercisesSlide } from './components/slides/TopExercisesSlide';
import { ConsistencySlide } from './components/slides/ConsistencySlide';
import { SummarySlide } from './components/slides/SummarySlide';

import { UploadScreen } from './components/UploadScreen';
import { OrientationLock } from './components/OrientationLock';
import { BugReporter } from './components/BugReporter';


function App() {
  const { loading, stats, error, loadCSV, rawCSV } = useWorkoutData();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <OrientationLock />
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-slate-400">Crunching the numbers...</p>
      </div>
    );
  }

  if (stats) {
    return (
      <div className="min-h-screen bg-black text-slate-100 font-sans">
        <OrientationLock />
        <BugReporter rawCSV={rawCSV} />
        <StoryContainer>
          <IntroSlide year={stats.year} />
          <StatsSlide stats={stats} />
          <TopExercisesSlide stats={stats} />
          <ConsistencySlide stats={stats} />
          <SummarySlide stats={stats} />
        </StoryContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans">
      <OrientationLock />
      <BugReporter rawCSV={rawCSV} />
      {error && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20">
          {error}
        </div>
      )}
      <UploadScreen onDataLoaded={loadCSV} />
    </div>
  );
}

export default App;
