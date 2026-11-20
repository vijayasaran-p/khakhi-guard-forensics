import bcrypt from 'bcryptjs';
import { prisma } from '../db/client.js';
import { logger } from '../logger/index.js';

async function main() {
  logger.info('Starting KHAKHI GUARD Database Seeding (Phase 9)...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.mediaFinding.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.telecomCdr.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.case.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('KhakhiGuard@2026', 10);

  // 1. Create Law Enforcement Officers
  const supervisor = await prisma.user.create({
    data: {
      name: 'SP Amrita Sehgal',
      badgeNumber: 'CH-IPS-2024-092',
      email: 'officer.sehgal@chd.police.gov.in',
      passwordHash,
      role: 'SUPERVISOR',
      jurisdiction: 'Chandigarh UT'
    }
  });

  const investigator = await prisma.user.create({
    data: {
      name: 'SI Rajesh Kumar',
      badgeNumber: 'CH-CY-2025-144',
      email: 'io.rajesh@chd.police.gov.in',
      passwordHash,
      role: 'INVESTIGATOR',
      jurisdiction: 'Sector 17 Crime Branch'
    }
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Inspector R. Sharma',
      badgeNumber: 'CH-CY-2023-018',
      email: 'analyst.sharma@chd.police.gov.in',
      passwordHash,
      role: 'ANALYST',
      jurisdiction: 'I4C Forensic Cell'
    }
  });

  await prisma.user.create({
    data: {
      name: 'System Admin',
      badgeNumber: 'CH-ADM-2022-001',
      email: 'admin.it@chd.police.gov.in',
      passwordHash,
      role: 'ADMIN',
      jurisdiction: 'PHQ Chandigarh'
    }
  });

  logger.info('Created 4 Law Enforcement User Identities.');

  // 2. Create Cases
  const case1 = await prisma.case.create({
    data: {
      firNumber: 'KG-2026-0818',
      title: 'Tri-City Coordinated Extortion & Cyber Fraud Nexus',
      policeStation: 'Sector 17 Crime Branch, Chandigarh',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      financialExposure: 148500,
      totalFrozen: 148500,
      complainantName: 'Sunil Verma',
      accusedName: 'Vikram Singh',
      incidentDate: new Date('2026-08-10T14:15:00Z'),
      summary: 'Targeted spear-phishing and deepfake extortion video call followed by rapid multi-hop cryptocurrency layering.',
      investigatingOfficerId: supervisor.id
    }
  });

  const case2 = await prisma.case.create({
    data: {
      firNumber: 'KG-2026-0744',
      title: 'Sector 22 SIM-Box & VoIP Bypass Gateway',
      policeStation: 'Sector 22 Police Station, Chandigarh',
      status: 'OPEN',
      priority: 'HIGH',
      financialExposure: 84000,
      totalFrozen: 0,
      complainantName: 'Meenakshi Sundaram',
      accusedName: 'Gaurav Gill',
      incidentDate: new Date('2026-08-04T09:30:00Z'),
      summary: 'Illegal GSM gateway running 64 SIMs terminating fraudulent OTP harvest calls across Punjab & Haryana.',
      investigatingOfficerId: investigator.id
    }
  });

  const case3 = await prisma.case.create({
    data: {
      firNumber: 'KG-2026-0691',
      title: 'Multi-State ATM Mule Harvesting Network',
      policeStation: 'Sector 35 Police Station, Chandigarh',
      status: 'COURT_PROCEEDINGS',
      priority: 'CRITICAL',
      financialExposure: 210000,
      totalFrozen: 195000,
      complainantName: 'Dalbir Singh Dhillon',
      accusedName: 'Harpreet Singh',
      incidentDate: new Date('2026-07-28T18:45:00Z'),
      summary: 'Coordinated debit card cloning and ATM withdrawal network spanning Chandigarh, Mohali and Panchkula.',
      investigatingOfficerId: analyst.id
    }
  });

  await prisma.case.create({
    data: {
      firNumber: 'KG-2026-0520',
      title: 'Fake Electricity Bill OTP Extraction Syndicate',
      policeStation: 'IT Park Police Station, Chandigarh',
      status: 'CLOSED',
      priority: 'MEDIUM',
      financialExposure: 45000,
      totalFrozen: 45000,
      complainantName: 'Ramesh Chander',
      accusedName: 'Sanjay Rawat',
      incidentDate: new Date('2026-07-15T11:20:00Z'),
      summary: 'SMS phishing blitz purporting to be Chandigarh Electricity Department resulting in APK remote access trojan installation.',
      investigatingOfficerId: investigator.id
    }
  });

  await prisma.case.create({
    data: {
      firNumber: 'KG-2026-0312',
      title: 'Pig Butchering Fake Trading App Syndicate',
      policeStation: 'Sector 17 Crime Branch, Chandigarh',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      financialExposure: 380000,
      totalFrozen: 120000,
      complainantName: 'Dr. Ananya Joshi',
      accusedName: 'Kunal Singhal',
      incidentDate: new Date('2026-06-22T16:00:00Z'),
      summary: 'Victim induced into investing in counterfeit forex exchange via WhatsApp investment clubs.',
      investigatingOfficerId: supervisor.id
    }
  });

  logger.info('Created 5 Statutory FIR Case Dockets.');

  // 3. Create Case 1 Evidence Records
  const firEvidence = await prisma.evidence.create({
    data: {
      caseId: case1.id,
      evidenceType: 'FIR_PDF',
      originalFilename: 'FIR_CC_CH_2026_0818.pdf',
      mimeType: 'application/pdf',
      storagePath: 'evidence/fir/FIR_CC_CH_2026_0818.pdf',
      fileSizeBytes: 2450000,
      sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      processingStatus: 'COMPLETED',
      uploaderId: supervisor.id
    }
  });

  const cdrEvidence = await prisma.evidence.create({
    data: {
      caseId: case1.id,
      evidenceType: 'CDR_CSV',
      originalFilename: 'CDR_Export_9876543210_Aug10.csv',
      mimeType: 'text/csv',
      storagePath: 'evidence/cdr/CDR_Export_9876543210_Aug10.csv',
      fileSizeBytes: 428000,
      sha256Hash: '4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b',
      processingStatus: 'COMPLETED',
      uploaderId: supervisor.id
    }
  });

  const mediaEvidence = await prisma.evidence.create({
    data: {
      caseId: case1.id,
      evidenceType: 'MEDIA_VIDEO',
      originalFilename: 'V_Threat_Call_CH_0818.mp4',
      mimeType: 'video/mp4',
      storagePath: 'evidence/media/V_Threat_Call_CH_0818.mp4',
      fileSizeBytes: 18400000,
      sha256Hash: '8f96e20349b1c7da2019ffcd9018e3c7db17c802e9a7e28b7e21a78c187bc93f',
      processingStatus: 'COMPLETED',
      uploaderId: supervisor.id
    }
  });

  // 4. Create Entities for Case 1
  const entSuspect1 = await prisma.entity.create({
    data: {
      caseId: case1.id,
      type: 'PERSON',
      value: 'Vikram Singh',
      name: 'Vikram Singh',
      category: 'IDENTIFIED_SYNDICATE_OPERATOR',
      riskScore: 94,
      isVerified: true,
      metadata: JSON.stringify({ role: 'Prime Accused / Syndicate Controller', firReference: 'KG-2026-0818' })
    }
  });

  const entSuspect2 = await prisma.entity.create({
    data: {
      caseId: case1.id,
      type: 'PERSON',
      value: 'Amit Kumar',
      name: 'Amit Kumar',
      category: 'IDENTIFIED_SYNDICATE_OPERATOR',
      riskScore: 88,
      isVerified: true,
      metadata: JSON.stringify({ role: 'Mule Layer Controller', bankBranch: 'Sector 19 Axis Bank' })
    }
  });

  const entPhone1 = await prisma.entity.create({
    data: {
      caseId: case1.id,
      type: 'PHONE',
      value: '+91 98765 43210',
      name: 'Target Extortion Device MSISDN',
      category: 'CELLULAR_BTS_INTERCEPTS',
      riskScore: 91,
      isVerified: true,
      metadata: JSON.stringify({ provider: 'Bharti Airtel', imsi: '404-20-109283', tower: 'Sector 17 BTS-07' })
    }
  });

  const entPhone2 = await prisma.entity.create({
    data: {
      caseId: case1.id,
      type: 'PHONE',
      value: '+91 98765 01234',
      name: 'Co-conspirator Drop SIM',
      category: 'CELLULAR_BTS_INTERCEPTS',
      riskScore: 84,
      isVerified: true,
      metadata: JSON.stringify({ provider: 'Reliance Jio', imsi: '404-20-884920', tower: 'Sector 22 BTS-14' })
    }
  });

  const entWallet1 = await prisma.entity.create({
    data: {
      caseId: case1.id,
      type: 'CRYPTO_WALLET',
      value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      name: 'Mule Gateway Wallet (Hop 1)',
      category: 'ONCHAIN_LEDGER_TRANSIT',
      riskScore: 95,
      isVerified: true,
      metadata: JSON.stringify({ network: 'Ethereum', hop: 1, balanceEth: 0.046 })
    }
  });

  const entWallet2 = await prisma.entity.create({
    data: {
      caseId: case1.id,
      type: 'CRYPTO_WALLET',
      value: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
      name: 'Transit Mixing Contract (Hop 2)',
      category: 'ONCHAIN_LEDGER_TRANSIT',
      riskScore: 89,
      isVerified: true,
      metadata: JSON.stringify({ network: 'Ethereum', hop: 2, balanceEth: 0.042 })
    }
  });

  // 5. Create Relationships
  await prisma.relationship.create({
    data: {
      caseId: case1.id,
      sourceEntityId: entSuspect1.id,
      targetEntityId: entPhone1.id,
      relationshipType: 'KYC_SUBSCRIBER_BINDING',
      confidenceScore: 0.98,
      sourceEvidenceId: firEvidence.id,
      notes: 'IMSI 404-20-109283 linked to Vikram Singh via fraudulent Aadhaar registration'
    }
  });

  await prisma.relationship.create({
    data: {
      caseId: case1.id,
      sourceEntityId: entSuspect1.id,
      targetEntityId: entWallet1.id,
      relationshipType: 'MULE_OFFRAMP_ROUTING',
      confidenceScore: 0.96,
      sourceEvidenceId: firEvidence.id,
      notes: 'P2P bank debit of ₹1,50,000 directly received by Hop 1 wallet'
    }
  });

  await prisma.relationship.create({
    data: {
      caseId: case1.id,
      sourceEntityId: entPhone1.id,
      targetEntityId: entPhone2.id,
      relationshipType: 'CALL_COORDINATION',
      confidenceScore: 0.94,
      sourceEvidenceId: cdrEvidence.id,
      notes: 'Three 240s calls concurrent with victim extortion transfer'
    }
  });

  await prisma.relationship.create({
    data: {
      caseId: case1.id,
      sourceEntityId: entWallet1.id,
      targetEntityId: entWallet2.id,
      relationshipType: 'CRYPTO_LAYERING_HOP',
      confidenceScore: 0.99,
      sourceEvidenceId: firEvidence.id,
      notes: '0.046 ETH transferred to Hop 2 within 18 minutes of deposit'
    }
  });

  // 6. Telecom CDR records
  await prisma.telecomCdr.create({
    data: {
      evidenceId: cdrEvidence.id,
      callerNumber: '+91 98765 43210',
      receiverNumber: '+91 98765 01234',
      callTimestamp: new Date('2026-08-10T14:28:00Z'),
      durationSec: 240,
      towerId: 'Sector 17 BTS-07',
      towerLocation: 'Sector 17, Chandigarh',
      latitude: 30.7398,
      longitude: 76.7827,
      imsi: '404-20-109283',
      isCritical: true
    }
  });

  await prisma.telecomCdr.create({
    data: {
      evidenceId: cdrEvidence.id,
      callerNumber: '+91 98765 01234',
      receiverNumber: '+91 99887 65432',
      callTimestamp: new Date('2026-08-10T15:05:00Z'),
      durationSec: 180,
      towerId: 'Sector 22 BTS-14',
      towerLocation: 'Sector 22, Chandigarh',
      latitude: 30.7250,
      longitude: 76.7720,
      imsi: '404-20-884920',
      isCritical: true
    }
  });

  // 7. Financial Transactions
  await prisma.financialTransaction.create({
    data: {
      caseId: case1.id,
      evidenceId: firEvidence.id,
      txHash: '0x8f192b49c01824a1e93847b2c019d8471e9482b01938a1928471092837482910',
      network: 'ETH',
      sourceWallet: 'Axis Bank SB-Sector19 (Mule #8192)',
      destWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      amount: 150000,
      currency: 'INR',
      hopNumber: 1,
      isFrozen: true,
      exchangeInfo: 'P2P Conversion Desk',
      timestamp: new Date('2026-08-10T14:15:00Z')
    }
  });

  await prisma.financialTransaction.create({
    data: {
      caseId: case1.id,
      evidenceId: firEvidence.id,
      txHash: '0x3c99a812b481928374a102938471029384710293847102938471029384710293',
      network: 'ETH',
      sourceWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      destWallet: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
      amount: 0.046,
      currency: 'ETH',
      hopNumber: 2,
      isFrozen: false,
      exchangeInfo: 'Mixing Contract',
      timestamp: new Date('2026-08-10T14:48:00Z')
    }
  });

  // 8. Media Findings
  await prisma.mediaFinding.create({
    data: {
      evidenceId: mediaEvidence.id,
      anomalyType: 'FACIAL_MESH_JITTER',
      track: 'video',
      startTime: 8.0,
      endTime: 15.0,
      confidence: 96,
      label: 'Biometric Face Overlay (Deepfake)',
      description: 'Facial boundary landmark jitter (4.2σ deviation). Blinking cadence 4σ below biological baseline.',
      xaiRationale: 'Pixel-level gradient boundaries show generative blending mismatch at mandibular contour.',
      evidenceTypeTag: 'AI'
    }
  });

  await prisma.mediaFinding.create({
    data: {
      evidenceId: mediaEvidence.id,
      anomalyType: 'SYNTHETIC_VOICE_CLONE',
      track: 'audio',
      startTime: 8.0,
      endTime: 15.0,
      confidence: 94,
      label: 'Synthetic Voice Clone',
      description: 'Extortion audio synthesis envelope mismatch. Flat fundamental frequency transitions.',
      xaiRationale: 'F0 contour flat (variance σ = 0.04 Hz vs. natural baseline 8–12 Hz). Zero respiration pauses.',
      evidenceTypeTag: 'AI'
    }
  });

  logger.info('KHAKHI GUARD Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    logger.error('Seed script error', { error: e.message, stack: e.stack });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
