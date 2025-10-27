import React, { useState, useMemo } from 'react';

const CalculatorCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg">
        <h2 className="text-xl font-bold text-accent mb-4">{title}</h2>
        {children}
    </div>
);

const InputField: React.FC<{ label: string, unit: string, value: number, onChange: (val: number) => void }> = ({ label, unit, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary">{label}</label>
        <div className="mt-1 flex items-center bg-background-tertiary rounded-md border border-border-color">
            <input 
                type="number" 
                step="any"
                value={value} 
                onChange={e => onChange(parseFloat(e.target.value) || 0)} 
                className="w-full bg-transparent p-2 text-text-primary focus:outline-none"
            />
            <span className="px-3 text-text-secondary text-sm">{unit}</span>
        </div>
    </div>
);

const ResultDisplay: React.FC<{ label: string, value: string, unit: string }> = ({ label, value, unit }) => (
    <div className="bg-background-primary/50 p-3 rounded-md text-center">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value} <span className="text-lg">{unit}</span></p>
    </div>
);

const RaceTimePredictor = () => {
    const [mass, setMass] = useState(60); // grams
    const [cd, setCd] = useState(0.4);
    const [frontalArea, setFrontalArea] = useState(0.0025); // m^2

    const predictedTime = useMemo(() => {
        const massKg = mass / 1000;
        const airDensity = 1.225; // kg/m^3
        const trackLength = 20; // meters
        const avgThrust = 3.0; // Newtons (average from CO2 cartridge)
        const thrustDuration = 0.5; // seconds
        
        const dragFactor = 0.5 * airDensity * cd * frontalArea;
        
        // Simplified model: F_net = F_thrust - F_drag
        // This is a complex differential equation, so we'll use a simplified energy-based approximation
        const workByThrust = avgThrust * trackLength;
        const avgVelocityForDrag = 15; // Assume an average velocity for drag calculation
        const workAgainstDrag = dragFactor * Math.pow(avgVelocityForDrag, 2) * trackLength;

        const netWork = workByThrust - workAgainstDrag;
        if (netWork <= 0) return { time: Infinity, speed: 0 };
        
        const finalVelocity = Math.sqrt((2 * netWork) / massKg);
        const avgVelocity = finalVelocity / 2;
        const time = trackLength / avgVelocity;

        return { time: time, speed: finalVelocity };
    }, [mass, cd, frontalArea]);

    return (
        <CalculatorCard title="Race Time Predictor">
            <div className="space-y-4">
                <InputField label="Car Mass" unit="g" value={mass} onChange={setMass} />
                <InputField label="Drag Coefficient (Cd)" unit="" value={cd} onChange={setCd} />
                <InputField label="Frontal Area" unit="m²" value={frontalArea} onChange={setFrontalArea} />
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <ResultDisplay label="Predicted Time" value={isFinite(predictedTime.time) ? predictedTime.time.toFixed(3) : 'N/A'} unit="s" />
                    <ResultDisplay label="Finish Speed" value={isFinite(predictedTime.time) ? predictedTime.speed.toFixed(2) : 'N/A'} unit="m/s" />
                </div>
            </div>
        </CalculatorCard>
    );
};

const DragForceCalculator = () => {
    const [cd, setCd] = useState(0.4);
    const [frontalArea, setFrontalArea] = useState(0.0025); // m^2
    const [velocity, setVelocity] = useState(80); // km/h

    const dragForce = useMemo(() => {
        const velocityMps = velocity / 3.6;
        const airDensity = 1.225; // kg/m^3
        return 0.5 * airDensity * cd * frontalArea * Math.pow(velocityMps, 2);
    }, [cd, frontalArea, velocity]);

     return (
        <CalculatorCard title="Drag Force Calculator">
            <div className="space-y-4">
                <InputField label="Drag Coefficient (Cd)" unit="" value={cd} onChange={setCd} />
                <InputField label="Frontal Area" unit="m²" value={frontalArea} onChange={setFrontalArea} />
                <InputField label="Velocity" unit="km/h" value={velocity} onChange={setVelocity} />
                <div className="pt-2">
                    <ResultDisplay label="Calculated Drag Force" value={dragForce.toFixed(3)} unit="N" />
                </div>
            </div>
        </CalculatorCard>
    );
};

const ToolkitPage: React.FC = () => {
    return (
         <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                    Engineer's Toolkit
                </h1>
                <p className="text-text-secondary mt-2">A collection of useful calculators for design and analysis.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <RaceTimePredictor />
                <DragForceCalculator />
            </div>
        </div>
    );
};

export default ToolkitPage;