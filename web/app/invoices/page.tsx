'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { FileText, Plus, Download, Trash2 } from 'lucide-react';

export default function Invoices() {
  interface Invoice {
      _id: string;
      invoiceNumber: string;
      clientName: string;
      createdAt: string;
      totalAmount: number;
      status: string;
      pdfUrl: string;
  }

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientGSTIN, setClientGSTIN] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, rate: 0 }]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems: any = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const generateInvoice = async () => {
    setLoading(true);
    try {
      await api.post('/invoices', { clientName, clientGSTIN, items });
      setShowModal(false);
      setClientName('');
      setClientGSTIN('');
      setItems([{ description: '', quantity: 1, rate: 0 }]);
      fetchInvoices();
    } catch (error) {
        console.error(error);
        alert('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (url: string) => {
    const downloadUrl = `http://localhost:5000/${url}`; 
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground mt-2">Manage and generate client invoices.</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow hover:bg-blue-600 flex items-center gap-2"
        >
            <Plus size={18} />
            Create Invoice
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase bg-slate-100">
                    <tr>
                        <th className="px-6 py-3">Invoice #</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {invoices.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                No invoices found. Create one to get started.
                            </td>
                        </tr>
                    ) : invoices.map((inv) => (
                        <tr key={inv._id} className="bg-card hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{inv.invoiceNumber}</td>
                            <td className="px-6 py-4">{inv.clientName}</td>
                            <td className="px-6 py-4 text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-bold">₹{inv.totalAmount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                    {inv.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => downloadInvoice(inv.pdfUrl)} 
                                    className="text-primary hover:underline flex items-center gap-1"
                                >
                                    <Download size={16} /> PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      {/* Modern Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">New Invoice</h2>
                    <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client Name</label>
                            <input 
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none" 
                                placeholder="Enter Name"
                                value={clientName}
                                onChange={e => setClientName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">GSTIN (Optional)</label>
                             <input 
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none" 
                                placeholder="GST Number"
                                value={clientGSTIN}
                                onChange={e => setClientGSTIN(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Items</label>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <input 
                                        className="flex-1 p-2 border rounded-md text-sm" 
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={e => updateItem(idx, 'description', e.target.value)}
                                    />
                                    <input 
                                        type="number"
                                        className="w-20 p-2 border rounded-md text-sm" 
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                    />
                                    <input 
                                        type="number"
                                        className="w-24 p-2 border rounded-md text-sm" 
                                        placeholder="Rate"
                                        value={item.rate}
                                        onChange={e => updateItem(idx, 'rate', Number(e.target.value))}
                                    />
                                    {items.length > 1 && (
                                        <button onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={addItem} className="text-primary text-sm hover:underline flex items-center gap-1 mt-2">
                            <Plus size={14} /> Add Another Item
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancel</button>
                        <button 
                            onClick={generateInvoice} 
                            disabled={loading} 
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate Invoice'}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
}
