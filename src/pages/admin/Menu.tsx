import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { MenuCategory, MenuItem } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Menu() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const settings = storage.getSettings();

  const loadData = () => {
    setCategories(storage.getMenuCategories().sort((a, b) => a.sortOrder - b.sortOrder));
    setItems(storage.getMenuItems().sort((a, b) => a.sortOrder - b.sortOrder));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-heading text-charcoal-900">Menu Management</h2>
          <p className="text-charcoal-600 text-sm mt-1">Manage categories, dishes, and pricing</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-charcoal-300 rounded text-sm text-charcoal-600 hover:text-white">
            Add Category
          </button>
          <button className="px-4 py-2 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978]">
            Add Menu Item
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {categories.map(category => {
          const catItems = items.filter(i => i.categoryId === category.id);
          
          return (
            <div key={category.id} className="bg-white border border-charcoal-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-[#faf8f5] border-b border-charcoal-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-xl text-gold-gradient uppercase tracking-widest">{category.name}</h3>
                  {!category.isVisible && <span className="badge badge-gray">Hidden</span>}
                </div>
                <div className="flex gap-2 text-charcoal-600">
                  <button className="p-2 hover:text-[#c9a55a]"><Edit2 size={16} /></button>
                  <button className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="divide-y divide-charcoal-200">
                {catItems.map(item => (
                  <div key={item.id} className="p-4 flex gap-4 hover:bg-[#e8e5e2]/30 transition-colors">
                    <div className="w-16 h-16 bg-[#faf8f5] rounded border border-charcoal-300 flex-shrink-0 flex items-center justify-center text-charcoal-600">
                      IMG
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-charcoal-900">{item.name}</span>
                          {item.dietaryType === 'veg' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                          {item.dietaryType === 'vegan' && <span className="w-2 h-2 rounded-full bg-green-400"></span>}
                          {item.isFeatured && <span className="text-[10px] uppercase tracking-wider text-[#c9a55a] border border-[#c9a55a] px-1.5 rounded-sm">Featured</span>}
                          {!item.isAvailable && <span className="badge badge-red">Sold Out</span>}
                        </div>
                        <span className="text-[#c9a55a] font-medium">{settings.currencySymbol}{item.price}</span>
                      </div>
                      <p className="text-sm text-charcoal-600 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-start gap-2 text-charcoal-500 border-l border-charcoal-200 pl-4 ml-2">
                      <button className="p-1.5 hover:text-[#c9a55a]"><Edit2 size={14} /></button>
                      <button className="p-1.5 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {catItems.length === 0 && (
                  <div className="p-8 text-center text-charcoal-500 text-sm">
                    No items in this category.
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-[#faf8f5]/50 border-t border-charcoal-200 text-center">
                <button className="text-sm text-[#c9a55a] hover:text-charcoal-900 flex items-center justify-center gap-2 w-full py-1">
                  <Plus size={16} /> Add Item to {category.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
