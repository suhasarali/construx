'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Package, History, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [logs, setLogs] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setInventory(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchLogs = async (item: any) => {
        setSelectedItem(item);
        try {
            const res = await api.get(`/inventory/${item._id}/logs`);
            setLogs(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inventory List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.map((item: any) => (
                        <div 
                            key={item._id} 
                            onClick={() => fetchLogs(item)}
                            className={`p-6 rounded-lg border cursor-pointer transition-all ${selectedItem?._id === item._id ? 'bg-primary/5 border-primary' : 'bg-card border-border hover:border-primary/50'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                                <Package className={selectedItem?._id === item._id ? 'text-primary' : 'text-muted-foreground'} size={20} />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-bold ${item.quantity <= item.lowStockThreshold ? 'text-destructive' : 'text-foreground'}`}>
                                    {item.quantity}
                                </span>
                                <span className="text-muted-foreground">{item.unit}</span>
                            </div>
                            {item.quantity <= item.lowStockThreshold && (
                                <p className="text-xs text-destructive mt-1 font-medium">Low Stock Warning</p>
                            )}
                        </div>
                    ))}
                    
                    {inventory.length === 0 && !loading && (
                        <div className="col-span-full text-center py-10 text-muted-foreground bg-card rounded-lg border border-border">
                            No inventory items found. Approve a request to populate stock.
                        </div>
                    )}
                </div>

                {/* Logs / Details Sidebar */}
                <div className="bg-card rounded-lg border border-border p-6 h-fit sticky top-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                        <History size={20} />
                        {selectedItem ? `${selectedItem.name} History` : 'Select an Item'}
                    </h2>

                    {!selectedItem ? (
                        <p className="text-muted-foreground text-sm">Click on an inventory card to view its transaction history.</p>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {logs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No history found.</p>
                            ) : (
                                logs.map((log: any) => (
                                    <div key={log._id} className="relative pl-6 pb-2 border-l border-border last:border-0">
                                        <div className={`absolute left-[-9px] top-0 p-1 rounded-full ${log.type === 'IN' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {log.type === 'IN' ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between">
                                                <span className={`font-semibold ${log.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                                </span>
                                                <span className="text-muted-foreground text-xs">{new Date(log.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-foreground font-medium text-xs mt-1">{log.reason}</p>
                                            <p className="text-muted-foreground text-xs">{log.notes}</p>
                                            <p className="text-muted-foreground text-[10px] mt-1">by {log.performedBy?.name}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
