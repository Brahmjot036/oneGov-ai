export default function Features(){
    const items = [
    ['Comprehensive', 'All categories and central/state schemes'],
    ['AI Chat', 'Ask natural questions — get policy and process answers'],
    ['Multilingual', 'Language selector + translations'],
    ['Saved Searches', 'Save and export scheme summaries']
    ]
    return (
    <section id="features" className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
    {items.map(([t,d])=> (
    <div key={t} className="p-6 bg-white rounded-2xl shadow">
    <h3 className="font-semibold text-lg">{t}</h3>
    <p className="text-gray-600 mt-2">{d}</p>
    </div>
    ))}
    </section>
    )
    }
    