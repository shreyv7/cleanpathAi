import { useState, useEffect } from 'react';
import { telemetryEngine, type TelemetryState } from '@/lib/telemetryEngine';

export function useTelemetry() {
    const [state, setState] = useState<TelemetryState>(() => telemetryEngine.getState());

    useEffect(() => {
        return telemetryEngine.subscribe((newState) => {
            setState({ ...newState });
        });
    }, []);

    return state;
}
