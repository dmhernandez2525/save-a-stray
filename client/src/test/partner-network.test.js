import { describe, it, expect } from 'vitest';
import {
  createOnboarding, advanceOnboarding, getOnboardingPercentage, isOnboardingComplete,
  scheduleAppointment, confirmAppointment, cancelAppointment,
  requestTransfer, approveTransfer, completeTransfer, cancelTransfer,
  createTransportRoute, assignDriver, startTransport, completeTransport,
  listAvailableResources, requestResource,
  searchPartners, getPartnersByType,
  createMessage, createAnnouncement, getAnnouncementsForPartner,
  calculatePartnerAnalytics,
} from '../lib/partner-network';

const basePartner = {
  id: 'p1', name: 'Happy Paws Vet', type: 'veterinary', status: 'active',
  contactName: 'Dr. Smith', contactEmail: 'vet@example.com', contactPhone: '555-1234',
  address: '123 Vet St', city: 'Portland', state: 'OR', zipCode: '97201',
  description: 'Full-service veterinary clinic', services: ['spay/neuter', 'vaccinations', 'dental'],
  joinedAt: '2025-01-01',
};

describe('Partner Network', () => {

  describe('Onboarding', () => {
    it('should start at application step', () => {
      const ob = createOnboarding('p1');
      expect(ob.currentStep).toBe('application');
      expect(ob.completedSteps).toHaveLength(0);
    });

    it('should advance through steps', () => {
      let ob = createOnboarding('p1');
      ob = advanceOnboarding(ob);
      expect(ob.currentStep).toBe('review');
      expect(ob.completedSteps).toContain('application');
    });

    it('should track completion percentage', () => {
      let ob = createOnboarding('p1');
      expect(getOnboardingPercentage(ob)).toBe(0);
      ob = advanceOnboarding(ob);
      expect(getOnboardingPercentage(ob)).toBeGreaterThan(0);
    });

    it('should detect complete onboarding', () => {
      let ob = createOnboarding('p1');
      for (let i = 0; i < 5; i++) ob = advanceOnboarding(ob);
      expect(isOnboardingComplete(ob)).toBe(true);
      expect(ob.completedAt).toBeTruthy();
    });

    it('should not advance past complete', () => {
      let ob = createOnboarding('p1');
      for (let i = 0; i < 6; i++) ob = advanceOnboarding(ob);
      expect(ob.currentStep).toBe('complete');
    });
  });

  describe('Vet Appointments', () => {
    it('should schedule appointment', () => {
      const apt = scheduleAppointment('clinic1', 'animal1', '2026-03-01', '10:00', 'Checkup');
      expect(apt.status).toBe('scheduled');
      expect(apt.reason).toBe('Checkup');
    });

    it('should confirm appointment', () => {
      const apt = scheduleAppointment('clinic1', 'animal1', '2026-03-01', '10:00', 'Checkup');
      expect(confirmAppointment(apt).status).toBe('confirmed');
    });

    it('should cancel appointment', () => {
      const apt = scheduleAppointment('clinic1', 'animal1', '2026-03-01', '10:00', 'Checkup');
      expect(cancelAppointment(apt).status).toBe('cancelled');
    });
  });

  describe('Animal Transfers', () => {
    it('should request transfer', () => {
      const xfer = requestTransfer('animal1', 'org1', 'org2', 'Overcrowding');
      expect(xfer.status).toBe('requested');
      expect(xfer.reason).toBe('Overcrowding');
    });

    it('should approve transfer', () => {
      const xfer = requestTransfer('animal1', 'org1', 'org2', 'Reason');
      expect(approveTransfer(xfer).status).toBe('approved');
    });

    it('should complete transfer', () => {
      const xfer = approveTransfer(requestTransfer('animal1', 'org1', 'org2', 'Reason'));
      const completed = completeTransfer(xfer);
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeTruthy();
    });

    it('should cancel transfer', () => {
      const xfer = requestTransfer('animal1', 'org1', 'org2', 'Reason');
      expect(cancelTransfer(xfer).status).toBe('cancelled');
    });
  });

  describe('Transport Coordination', () => {
    it('should create transport route', () => {
      const route = createTransportRoute(
        { address: 'Portland, OR', lat: 45.52, lng: -122.68 },
        { address: 'Seattle, WA', lat: 47.61, lng: -122.33 },
        ['animal1', 'animal2'],
        '2026-03-15'
      );
      expect(route.status).toBe('planned');
      expect(route.distanceKm).toBeGreaterThan(0);
      expect(route.estimatedMinutes).toBeGreaterThan(0);
      expect(route.animalIds).toHaveLength(2);
    });

    it('should assign driver', () => {
      const route = createTransportRoute(
        { address: 'A', lat: 45.0, lng: -122.0 },
        { address: 'B', lat: 46.0, lng: -122.0 },
        ['a1'], '2026-03-15'
      );
      const assigned = assignDriver(route, 'driver1');
      expect(assigned.driverId).toBe('driver1');
    });

    it('should track transport status', () => {
      let route = createTransportRoute(
        { address: 'A', lat: 45.0, lng: -122.0 },
        { address: 'B', lat: 46.0, lng: -122.0 },
        ['a1'], '2026-03-15'
      );
      route = startTransport(route);
      expect(route.status).toBe('in-progress');
      route = completeTransport(route);
      expect(route.status).toBe('completed');
    });
  });

  describe('Shared Resources', () => {
    const resources = [
      { id: 'r1', type: 'foster-home', name: 'Smith Family', description: 'Can host 2 cats', ownerId: 'org1', available: true, quantity: 2, location: 'Portland' },
      { id: 'r2', type: 'supplies', name: 'Dog Food', description: '50lb bags', ownerId: 'org2', available: true, quantity: 10, location: 'Seattle' },
      { id: 'r3', type: 'foster-home', name: 'Jones Family', description: 'Can host 1 dog', ownerId: 'org1', available: false, quantity: 1, location: 'Portland' },
    ];

    it('should list available resources', () => {
      const available = listAvailableResources(resources);
      expect(available).toHaveLength(2);
    });

    it('should filter by type', () => {
      const fosters = listAvailableResources(resources, 'foster-home');
      expect(fosters).toHaveLength(1);
      expect(fosters[0].id).toBe('r1');
    });

    it('should handle resource requests', () => {
      const result = requestResource(resources[1], 5);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it('should reject insufficient quantity', () => {
      const result = requestResource(resources[1], 15);
      expect(result.success).toBe(false);
      expect(result.reason).toContain('Insufficient');
    });

    it('should reject unavailable resources', () => {
      const result = requestResource(resources[2], 1);
      expect(result.success).toBe(false);
    });
  });

  describe('Partner Directory', () => {
    const partners = [
      basePartner,
      { ...basePartner, id: 'p2', name: 'Pet Paradise Store', type: 'pet-store', city: 'Seattle', description: 'Pet supplies store', services: ['food', 'toys'] },
      { ...basePartner, id: 'p3', name: 'Rescue Friends', type: 'rescue', city: 'Portland', services: ['adoption', 'foster'] },
      { ...basePartner, id: 'p4', name: 'Inactive Partner', type: 'veterinary', status: 'inactive' },
    ];

    it('should search by name', () => {
      const results = searchPartners(partners, 'Happy Paws');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('p1');
    });

    it('should search by city', () => {
      const results = searchPartners(partners, 'Portland');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by type', () => {
      const results = searchPartners(partners, '', 'rescue');
      expect(results).toHaveLength(1);
    });

    it('should exclude inactive partners', () => {
      const results = searchPartners(partners, '');
      expect(results.find(p => p.id === 'p4')).toBeUndefined();
    });

    it('should get partners by type', () => {
      const vets = getPartnersByType(partners, 'veterinary');
      expect(vets).toHaveLength(1);
    });
  });

  describe('Communication', () => {
    it('should create partner message', () => {
      const msg = createMessage('p1', 'p2', 'Transfer Request', 'Can you take 2 cats?');
      expect(msg.fromPartnerId).toBe('p1');
      expect(msg.subject).toBe('Transfer Request');
    });

    it('should create announcement', () => {
      const ann = createAnnouncement('admin', 'New Policy', 'Updated transfer policy', ['veterinary', 'rescue']);
      expect(ann.targetTypes).toHaveLength(2);
    });

    it('should filter announcements for partner type', () => {
      const announcements = [
        { id: 'a1', authorId: 'admin', title: 'Vet Update', body: '...', targetTypes: ['veterinary'], publishedAt: '2026-01-01' },
        { id: 'a2', authorId: 'admin', title: 'All Partners', body: '...', targetTypes: ['veterinary', 'rescue', 'pet-store'], publishedAt: '2026-01-01' },
        { id: 'a3', authorId: 'admin', title: 'Rescue Only', body: '...', targetTypes: ['rescue'], publishedAt: '2026-01-01' },
      ];
      const vetAnns = getAnnouncementsForPartner(announcements, 'veterinary');
      expect(vetAnns).toHaveLength(2);
    });

    it('should exclude expired announcements', () => {
      const announcements = [
        { id: 'a1', authorId: 'admin', title: 'Expired', body: '...', targetTypes: ['veterinary'], publishedAt: '2025-01-01', expiresAt: '2025-06-01' },
      ];
      expect(getAnnouncementsForPartner(announcements, 'veterinary')).toHaveLength(0);
    });
  });

  describe('Analytics', () => {
    it('should calculate partner analytics', () => {
      const partners = [
        { ...basePartner, status: 'active' },
        { ...basePartner, id: 'p2', type: 'rescue', status: 'active' },
        { ...basePartner, id: 'p3', status: 'inactive' },
      ];
      const transfers = [
        { id: 'x1', animalId: 'a1', fromOrganizationId: 'org1', toOrganizationId: 'org2', status: 'completed', reason: '', requestedAt: '', completedAt: '2026-01-01' },
        { id: 'x2', animalId: 'a2', fromOrganizationId: 'org1', toOrganizationId: 'org2', status: 'requested', reason: '', requestedAt: '' },
      ];
      const appointments = [
        { id: 'apt1', clinicId: 'p1', animalId: 'a1', date: '2026-03-01', time: '10:00', reason: 'Checkup', status: 'completed' },
      ];
      const analytics = calculatePartnerAnalytics(partners, transfers, appointments);
      expect(analytics.totalPartners).toBe(3);
      expect(analytics.activePartners).toBe(2);
      expect(analytics.totalTransfers).toBe(1);
      expect(analytics.totalAppointments).toBe(1);
      expect(analytics.collaborationScore).toBeGreaterThan(0);
      expect(analytics.partnersByType['veterinary']).toBe(1);
    });
  });
});
