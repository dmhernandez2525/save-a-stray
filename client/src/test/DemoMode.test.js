import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DemoProvider, useDemo } from '../demo/DemoContext';
import DemoRoleSelector from '../demo/DemoRoleSelector';
import { demoAnimals, demoShelter, demoApplications } from '../demo/demoData';
import { getDemoUser, getAllDemoUsers, roleDescriptions } from '../demo/demoUsers';

// Mock the env config
vi.mock('../config/env', () => ({
  isDemoMode: vi.fn(() => true),
}));

// Test component to access demo context
const DemoConsumer = () => {
  const demo = useDemo();
  return (
    <div>
      <span data-testid="is-demo-enabled">{demo.isDemoModeEnabled.toString()}</span>
      <span data-testid="is-demo">{demo.isDemo.toString()}</span>
      <span data-testid="demo-role">{demo.demoRole}</span>
      <span data-testid="animals-count">{demo.animals.length}</span>
      <span data-testid="applications-count">{demo.applications.length}</span>
      <button onClick={() => demo.selectDemoUser('adopter')} data-testid="select-adopter">
        Select Adopter
      </button>
      <button onClick={() => demo.selectDemoUser('shelter_staff')} data-testid="select-staff">
        Select Staff
      </button>
      <button onClick={() => demo.exitDemoMode()} data-testid="exit-demo">
        Exit Demo
      </button>
    </div>
  );
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <DemoProvider>{component}</DemoProvider>
    </BrowserRouter>
  );
};

describe('Demo Mode', () => {
  describe('Demo Data', () => {
    it('should have demo animals', () => {
      expect(demoAnimals).toBeDefined();
      expect(demoAnimals.length).toBeGreaterThan(0);
    });

    it('should have demo shelter', () => {
      expect(demoShelter).toBeDefined();
      expect(demoShelter.name).toBe('Sunny Paws Rescue');
    });

    it('should have demo applications', () => {
      expect(demoApplications).toBeDefined();
      expect(demoApplications.length).toBeGreaterThan(0);
    });

    it('should have animals with required fields', () => {
      demoAnimals.forEach((animal) => {
        expect(animal._id).toBeDefined();
        expect(animal.name).toBeDefined();
        expect(animal.type).toBeDefined();
        expect(animal.status).toBeDefined();
      });
    });
  });

  describe('Demo Users', () => {
    it('should have all demo roles', () => {
      const users = getAllDemoUsers();
      expect(users.length).toBe(3);
    });

    it('should get adopter user', () => {
      const adopter = getDemoUser('adopter');
      expect(adopter).toBeDefined();
      expect(adopter.demoRole).toBe('adopter');
      expect(adopter.userRole).toBe('endUser');
    });

    it('should get shelter staff user', () => {
      const staff = getDemoUser('shelter_staff');
      expect(staff).toBeDefined();
      expect(staff.demoRole).toBe('shelter_staff');
      expect(staff.userRole).toBe('shelter');
      expect(staff.shelter).toBeDefined();
    });

    it('should get shelter admin user', () => {
      const admin = getDemoUser('shelter_admin');
      expect(admin).toBeDefined();
      expect(admin.demoRole).toBe('shelter_admin');
      expect(admin.userRole).toBe('shelter');
      expect(admin.shelter).toBeDefined();
    });

    it('should have role descriptions', () => {
      expect(roleDescriptions.adopter).toBeDefined();
      expect(roleDescriptions.shelter_staff).toBeDefined();
      expect(roleDescriptions.shelter_admin).toBeDefined();
      expect(roleDescriptions.adopter.features.length).toBeGreaterThan(0);
    });
  });

  describe('Demo Context', () => {
    it('should provide demo mode status', () => {
      renderWithProviders(<DemoConsumer />);
      expect(screen.getByTestId('is-demo-enabled').textContent).toBe('true');
    });

    it('should start with isDemo false (no user selected)', () => {
      renderWithProviders(<DemoConsumer />);
      expect(screen.getByTestId('is-demo').textContent).toBe('false');
    });

    it('should provide demo animals', () => {
      renderWithProviders(<DemoConsumer />);
      expect(parseInt(screen.getByTestId('animals-count').textContent)).toBe(demoAnimals.length);
    });

    it('should provide demo applications', () => {
      renderWithProviders(<DemoConsumer />);
      expect(parseInt(screen.getByTestId('applications-count').textContent)).toBe(
        demoApplications.length
      );
    });

    it('should select adopter role', () => {
      renderWithProviders(<DemoConsumer />);
      fireEvent.click(screen.getByTestId('select-adopter'));
      expect(screen.getByTestId('is-demo').textContent).toBe('true');
      expect(screen.getByTestId('demo-role').textContent).toBe('adopter');
    });

    it('should select shelter staff role', () => {
      renderWithProviders(<DemoConsumer />);
      fireEvent.click(screen.getByTestId('select-staff'));
      expect(screen.getByTestId('is-demo').textContent).toBe('true');
      expect(screen.getByTestId('demo-role').textContent).toBe('shelter');
    });

    it('should exit demo mode', () => {
      renderWithProviders(<DemoConsumer />);
      fireEvent.click(screen.getByTestId('select-adopter'));
      expect(screen.getByTestId('is-demo').textContent).toBe('true');
      fireEvent.click(screen.getByTestId('exit-demo'));
      expect(screen.getByTestId('is-demo').textContent).toBe('false');
    });
  });

  describe('Demo Role Selector', () => {
    it('should render when demo mode is enabled', () => {
      renderWithProviders(<DemoRoleSelector />);
      expect(screen.getByText('Demo Mode Enabled')).toBeInTheDocument();
    });

    it('should display all role options', () => {
      renderWithProviders(<DemoRoleSelector />);
      expect(screen.getByText('Pet Adopter')).toBeInTheDocument();
      // Use getAllByText since there are multiple instances (title and description)
      expect(screen.getAllByText(/Shelter Staff/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Shelter Administrator')).toBeInTheDocument();
    });

    it('should call onClose when clicking create account', () => {
      const onClose = vi.fn();
      renderWithProviders(<DemoRoleSelector onClose={onClose} />);
      fireEvent.click(screen.getByText('Create an account instead'));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
