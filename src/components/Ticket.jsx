import React from 'react';

const Ticket = ({
    businessName = "MarketFlow POS",
    address = "Calle Falsa 123, Ciudad",
    phone = "555-0123",
    dateTime = new Date().toLocaleString(),
    ticketNo = "00001",
    items = [
        { qty: 2, name: "Coca Cola 600ml", price: 18.00 },
        { qty: 1, name: "Sabritas Sal 45g", price: 15.00 },
        { qty: 3, name: "Chicle Trident", price: 2.00 },
    ],
    total = 57.00,
    paymentMethod = "Efectivo",
    cashGiven = 60.00,
    change = 3.00
}) => {
    return (
        <div className="bg-white p-4 max-w-[300px] mx-auto shadow-lg text-xs font-mono text-black">
            {/* Header */}
            <div className="text-center mb-2">
                <h2 className="text-xl font-bold uppercase">{businessName}</h2>
                <p>{address}</p>
                <p>Tel: {phone}</p>
            </div>

            {/* Info Ticket */}
            <div className="mb-2 border-b border-black pb-2 border-dashed">
                <p>Fecha: {dateTime}</p>
                <p>Ticket #: {ticketNo}</p>
            </div>

            {/* Items Header */}
            <div className="flex font-bold border-b border-black pb-1 mb-1">
                <span className="w-8">Cant</span>
                <span className="flex-1">Desc</span>
                <span className="w-12 text-right">Importe</span>
            </div>

            {/* Items List */}
            <div className="mb-2 border-b border-black pb-2 border-dashed">
                {items.map((item, index) => (
                    <div key={index} className="flex mb-1">
                        <span className="w-8">{item.qty}</span>
                        <span className="flex-1 truncate">{item.name}</span>
                        <span className="w-12 text-right">${(item.qty * item.price).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-1 text-right mb-4">
                <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Pago ({paymentMethod}):</span>
                    <span>${cashGiven.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Cambio:</span>
                    <span>${change.toFixed(2)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-black border-dashed pt-2">
                <p className="font-bold">¡GRACIAS POR SU COMPRA!</p>
                <p className="mt-1">Si requiere factura solicítela</p>
                <p>en el momento.</p>
            </div>
        </div>
    );
};

export default Ticket;
