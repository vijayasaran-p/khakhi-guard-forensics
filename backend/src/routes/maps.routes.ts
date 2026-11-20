import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const mapsRouter = Router();

mapsRouter.use(authMiddleware);

// GET /api/maps/threat-matrix
mapsRouter.get('/threat-matrix', async (req: Request, res: Response) => {
  return res.json({
    data: {
      center: [30.7333, 76.7794],
      zoom: 13,
      jurisdiction: 'Chandigarh UT',
      incidents: [
        { id: 'INC-CH-01', firId: 'KG-2026-0818', title: 'UPI Extortion & Call Triangulation', coords: [30.7398, 76.7827], station: 'Sector 17 Crime Branch', priority: 'CRITICAL', amount: '₹1,50,000' },
        { id: 'INC-CH-02', firId: 'KG-2026-0744', title: 'SIM Box Egress Nexus', coords: [30.7250, 76.7720], station: 'Sector 22 Police Station', priority: 'HIGH', amount: '₹84,000' },
        { id: 'INC-CH-03', firId: 'KG-2026-0691', title: 'Mule ATM Offramp Cluster', coords: [30.7210, 76.7580], station: 'Sector 35 Police Station', priority: 'CRITICAL', amount: '₹2,10,000' },
        { id: 'INC-CH-04', firId: 'KG-2026-0520', title: 'VoIP Spoofing Gateway', coords: [30.7240, 76.8400], station: 'IT Park Police Station', priority: 'MEDIUM', amount: '₹45,000' }
      ],
      towers: [
        { id: 'TWR-17', name: 'Sector 17 BTS-07', coords: [30.7398, 76.7827], provider: 'Airtel', activeSignals: 142 },
        { id: 'TWR-22', name: 'Sector 22 BTS-14', coords: [30.7250, 76.7720], provider: 'Jio', activeSignals: 98 },
        { id: 'TWR-35', name: 'Sector 35 BTS-09', coords: [30.7210, 76.7580], provider: 'Vodafone Idea', activeSignals: 76 },
        { id: 'TWR-ITP', name: 'IT Park BTS-02', coords: [30.7240, 76.8400], provider: 'Airtel', activeSignals: 110 }
      ]
    }
  });
});
