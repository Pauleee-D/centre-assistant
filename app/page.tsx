'use client';

import { useState, useMemo } from 'react';
import centresData from '../data/centres-list.json';
import { ThemeToggle } from '@/components/theme-toggle';

// Mapping of centre IDs to their website URLs
const centreWebsites: Record<string, string> = {
  albanycreek: 'https://albanycreeklc.com.au',
  ascotvale: 'https://www.movemv.com.au/ascot-vale-leisure-centre/',
  auburnruth: 'https://www.auburnaquaticcentre.com.au/',
  bathurstmanning: 'https://www.bathurstaquatic.com.au/',
  bright: 'https://www.brightsportscentre.com.au/',
  bundaberg: 'https://bundabergaquaticcentre.com.au/',
  burpengary: 'https://www.burpengaryralc.com.au/',
  canberraolympicpcw: 'https://www.canberraolympicpool.com.au/',
  chinchilla: 'https://chinchillaaquaticandfitnesscentre.com.au/',
  civicreserve: 'https://www.civicreccentre.com.au/',
  dalby: 'https://dalbyaquaticcentre.com.au/',
  dannyfrawley: 'https://www.dannyfrawleycentre.com.au/',
  dicksonpoolsseasonal: 'https://www.dicksonpool.com.au/',
  eastfremantlebactive: 'https://bactiveeastfremantle.com.au/',
  erindale: 'https://erindaleleisurecentre.com.au/',
  fernyhillswimmingpcw: 'https://www.fernyhillspool.com.au/',
  greatlakesleisurecentre: 'https://greatlakesalc.com.au/',
  gungahlinleisurecentre: 'https://www.gungahlinleisurecentre.com.au/',
  gurriwanyarrawellbeingcentre: 'https://www.gurriwanyarrawc.com.au/',
  gympieaquaticcentre: 'https://www.gympiearc.com.au/',
  jackhortmemorialpool: 'https://www.jackhortmcp.com.au/',
  keiloreastleisurecentre: 'https://www.movemv.com.au/keilor-east-leisure-centre/',
  knoxleisureworks: 'https://www.knoxleisureworks.com.au/',
  kurrikurriaquaticandfitnesscentre: 'https://www.kurrikurriafc.com.au/',
  lakesideleisurecentre: 'https://www.lakesideleisure.com.au/',
  loftusreccentre: 'https://www.loftusrecreationcentre.com.au/',
  manningmidcoasttaree: 'https://www.manningmidcoast.com.au/',
  mansfieldswimmingpool: 'https://www.mansfieldswimmingpool.com.au/',
  michaelclarkereccentre: 'https://www.michaelclarkecentre.com.au/',
  michaelwendenaquaticleisure: 'https://www.wendenpool.com.au/',
  millparkleisure: 'https://www.millparkleisure.com.au/',
  monbulkaquaticcentre: 'https://www.monbulkaquatic.com.au/',
  moreeartisanaquatic: 'https://www.moreeartesianaquaticcentre.com.au/',
  pelicanparkreccentre: 'https://www.pelicanparkrec.com.au/',
  portlandleisureandaquatic: 'https://www.portlandleisurecentre.com.au/',
  queensparkpool: 'https://www.movemv.com.au/queens-park-swimming-pool/',
  swellpalmersonpool: 'https://www.swellpalmerston.com.au/',
  swirlsmithton: 'https://www.swirltas.com.au/',
  singletonswimandgym: 'https://www.singletongymswim.com.au/',
  somervillereccentre: 'https://www.somervillerecreationcentre.com.au/',
  splashdevonport: 'https://www.splashdevonport.com.au/',
  stromloleisurecentre: 'https://www.stromloleisurecentre.com.au/',
  summit: 'https://summitaquaticleisure.com.au/',
  swanhill: 'https://www.swanhilllc.com.au/',
  tracthomastownreccentre: 'https://www.trac.com.au/',
  tehiku: 'https://tehikusportshub.co.nz/',
  tomareeseasonal: 'https://www.tomareeac.com.au/',
  watermarc: 'https://www.watermarcbanyule.com.au/',
  whittleseaswimcentreseasonal: 'https://www.watermarcbanyule.com.au/',
  whitlamleisurecentre: 'https://www.whitlamleisurecentre.com.au/',
  wollondilly: 'https://www.wclc.com.au/',
  wulandarecandconcentre: 'https://www.wulanda.com.au/',
  yawa: 'https://www.yawa.com.au/',
  yarracentre: 'https://www.yarracentre.com.au/',
  yarrambatparkgolfcourse: 'https://www.yarrambatparkgolf.com.au/',
  higherstatemelbairport: 'https://www.higherstate.com.au/',
  inverellaquaticcentre: 'https://www.inverellaquatic.com.au/',
  centrepointblayney: 'http://www.centrepointblayney.com.au/',
  robinvalerecandaquaticseasonal: 'https://www.robinvalerac.com.au/',
};

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCentre, setSelectedCentre] = useState('all');

  // Get unique states from centres data
  const states = useMemo(() => {
    const uniqueStates = [...new Set(centresData.map(c => c.state))].sort();
    return uniqueStates.filter(s => s !== 'Unknown');
  }, []);

  // Filter centres by selected state and sort alphabetically
  const filteredCentres = useMemo(() => {
    const centres = selectedState === 'all'
      ? centresData
      : centresData.filter(c => c.state === selectedState);
    return centres.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedState]);

  // Get the website URL for the selected centre
  const selectedCentreWebsite = useMemo(() => {
    if (selectedCentre === 'all') return null;
    return centreWebsites[selectedCentre] || null;
  }, [selectedCentre]);

  // Get the selected centre name
  const selectedCentreName = useMemo(() => {
    if (selectedCentre === 'all') return null;
    const centre = centresData.find(c => c.id === selectedCentre);
    return centre?.name || null;
  }, [selectedCentre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, centre: selectedCentre }),
      });

      const data = await response.json();
      setAnswer(data.answer || data.error);
    } catch (error) {
      setAnswer('Error: Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Leisure Centre Assistant</h1>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/4">
            <label htmlFor="state" className="block text-lg font-medium mb-2">
              State:
            </label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCentre('all'); // Reset centre selection when state changes
              }}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
              disabled={loading}
            >
              <option value="all">All</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="centre" className="block text-lg font-medium mb-2">
              Select Centre:
            </label>
            <select
              id="centre"
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
              disabled={loading}
            >
              <option value="all">All Centres</option>
              {filteredCentres.map(centre => (
                <option key={centre.id} value={centre.id}>
                  {centre.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCentreWebsite && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedCentreName} Website:
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                  {selectedCentreWebsite}
                </p>
              </div>
              <a
                href={selectedCentreWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Visit Website →
              </a>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="question" className="block text-lg font-medium mb-2">
            Ask a question:
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What time does the pool open?"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !question}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Ask Question'}
        </button>
      </form>

      {answer && (
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">Answer:</h2>
          <p className="text-gray-800 dark:text-gray-200">{answer}</p>
        </div>
      )}
    </main>
  );
}
