import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FoodItem, MealLog } from '../types';
import { Apple, Calendar, Check, Plus, Search, Trash2, Utensils } from 'lucide-react';

export const MealLoggingPage: React.FC = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH');
  const [notes, setNotes] = useState<string>('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [servings, setServings] = useState<number>(1);
  const [draftItems, setDraftItems] = useState<Array<{ foodItem: FoodItem; servings: number }>>([]);
  const [dayLogs, setDayLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch verified food items
  const loadFoods = async (q?: string) => {
    try {
      const endpoint = q ? `/meals/foods?q=${encodeURIComponent(q)}` : '/meals/foods';
      const res = await api.get<{ foods: FoodItem[] }>(endpoint);
      setFoods(res.foods);
      if (res.foods.length > 0 && !selectedFoodId) {
        setSelectedFoodId(res.foods[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching foods:', err);
    }
  };

  // Fetch logged meals for selected day
  const loadDayLogs = async (dateStr: string) => {
    try {
      const res = await api.get<{ logs: MealLog[] }>(`/meals/day?date=${dateStr}`);
      setDayLogs(res.logs);
    } catch (err: any) {
      console.error('Error fetching day logs:', err);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    loadDayLogs(date);
  }, [date]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    loadFoods(q);
  };

  const selectedFood = foods.find((f) => f.id === selectedFoodId);

  const addItemToDraft = () => {
    if (!selectedFood || servings <= 0) return;
    setDraftItems((prev) => [...prev, { foodItem: selectedFood, servings }]);
    setServings(1);
  };

  const removeDraftItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (draftItems.length === 0) {
      setErrorMsg('Please add at least one food item to this meal log.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/meals/log', {
        date,
        mealType,
        notes,
        items: draftItems.map((item) => ({
          foodItemId: item.foodItem.id,
          servings: item.servings
        }))
      });

      setSuccessMsg(`Successfully logged ${mealType.toLowerCase()}!`);
      setDraftItems([]);
      setNotes('');
      loadDayLogs(date);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record meal log.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Delete this meal entry?')) return;
    try {
      await api.delete(`/meals/${id}`);
      loadDayLogs(date);
    } catch (err: any) {
      alert(err.message || 'Failed to delete meal');
    }
  };

  // Draft totals calculation
  const draftTotals = draftItems.reduce(
    (acc, curr) => {
      const s = curr.servings;
      const f = curr.foodItem;
      acc.calories += f.calories * s;
      acc.protein += f.protein * s;
      acc.carbs += f.carbs * s;
      acc.fat += f.fat * s;
      acc.sodium += f.sodium * s;
      acc.potassium += f.potassium * s;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, potassium: 0 }
  );

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          <Utensils className="w-4 h-4" aria-hidden="true" />
          <span>Nutritional Self-Monitoring</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Log Daily Meals</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select standard foods or Filipino traditional meals. Your nutrient profile and Clinical Decision Support rules update in real time.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center space-x-2" role="alert">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-xs" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Meal Logging */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800">Add Meal Entry</h2>

          {/* Date & Meal Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label htmlFor="meal-date" className="block font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                id="meal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="meal-type" className="block font-semibold text-slate-700 mb-1">
                Meal Type
              </label>
              <select
                id="meal-type"
                value={mealType}
                onChange={(e: any) => setMealType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="SNACK">Snack</option>
              </select>
            </div>
          </div>

          {/* Search Foods */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label htmlFor="food-search" className="block text-xs font-semibold text-slate-700">
              Search Food Database ({foods.length} items available)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
              <input
                id="food-search"
                type="text"
                placeholder="Search adobo, sinigang, rice, chicken, oatmeal..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label htmlFor="food-select" className="sr-only">Selected Food</label>
                <select
                  id="food-select"
                  value={selectedFoodId}
                  onChange={(e) => setSelectedFoodId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {foods.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.name} ({food.calories} kcal / {food.servingSize} {food.servingUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 flex items-center space-x-2">
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-20 px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  aria-label="Number of servings"
                />
                <button
                  type="button"
                  onClick={addItemToDraft}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {selectedFood && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-slate-400">Calories</p>
                  <p className="font-bold text-slate-800">{Math.round(selectedFood.calories * servings)} kcal</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Protein</p>
                  <p className="font-bold text-emerald-700">{(selectedFood.protein * servings).toFixed(1)}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Carbs</p>
                  <p className="font-bold text-sky-700">{(selectedFood.carbs * servings).toFixed(1)}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Fat</p>
                  <p className="font-bold text-amber-700">{(selectedFood.fat * servings).toFixed(1)}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Sodium</p>
                  <p className="font-bold text-slate-800">{Math.round(selectedFood.sodium * servings)}mg</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Potassium</p>
                  <p className="font-bold text-slate-800">{Math.round(selectedFood.potassium * servings)}mg</p>
                </div>
              </div>
            )}
          </div>

          {/* Draft Items List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700">Items in this Meal ({draftItems.length})</p>
            {draftItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No foods added to this meal yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {draftItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{item.foodItem.name}</span>
                      <span className="text-slate-500 ml-2">
                        &times; {item.servings} serving ({Math.round(item.foodItem.calories * item.servings)} kcal)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDraftItem(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      aria-label={`Remove ${item.foodItem.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Submit */}
          <div>
            <label htmlFor="meal-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Notes (Optional)
            </label>
            <input
              id="meal-notes"
              type="text"
              placeholder="e.g. Ate at family gathering, drank 2 glasses of water"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            disabled={loading || draftItems.length === 0}
            onClick={handleLogMeal}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Saving Meal...' : `Save ${mealType} Entry (${Math.round(draftTotals.calories)} kcal)`}
          </button>
        </div>

        {/* Right Section: Today's Logged Meals History */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">
              Meals Logged for {date}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              {dayLogs.length} Entries
            </span>
          </div>

          {dayLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
              No meals logged yet for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {dayLogs.map((log) => {
                const logCalories = log.items.reduce(
                  (sum, item) => sum + item.foodItem.calories * item.servings,
                  0
                );
                return (
                  <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 px-2 py-0.5 bg-white border border-slate-200 rounded">
                        {log.mealType}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-emerald-700">{Math.round(logCalories)} kcal</span>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          aria-label="Delete meal log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <ul className="space-y-1 text-slate-600 pl-2 border-l-2 border-emerald-500">
                      {log.items.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.foodItem.name} &times; {item.servings}</span>
                          <span className="text-slate-400">{Math.round(item.foodItem.calories * item.servings)} kcal</span>
                        </li>
                      ))}
                    </ul>

                    {log.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
