
// Simple face recognition service 
// In a production environment, this would use proper face comparison algorithms

export class FaceRecognitionService {
  private storedFaces: { descriptor: Float32Array, voterId: string }[] = [];
  
  constructor() {
    this.loadStoredFaces();
  }
  
  private loadStoredFaces() {
    try {
      const storedFaces = localStorage.getItem('storedFaces');
      if (storedFaces) {
        // Parse stored faces and convert arrays back to Float32Array
        const parsedFaces = JSON.parse(storedFaces, (key, value) => {
          if (key === 'descriptor' && Array.isArray(value)) {
            return new Float32Array(value);
          }
          return value;
        });
        this.storedFaces = parsedFaces;
      }
    } catch (error) {
      console.error('Error loading stored faces:', error);
      this.storedFaces = [];
    }
  }
  
  private saveStoredFaces() {
    try {
      localStorage.setItem('storedFaces', JSON.stringify(this.storedFaces));
    } catch (error) {
      console.error('Error saving stored faces:', error);
    }
  }
  
  /**
   * Calculate distance between two face descriptors (lower is more similar)
   */
  private calculateDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
    if (descriptor1.length !== descriptor2.length) return Infinity;
    
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    return Math.sqrt(sum);
  }
  
  /**
   * Store a new face descriptor linked to a voter ID
   */
  public storeFace(descriptor: Float32Array, voterId: string): void {
    this.storedFaces.push({ descriptor, voterId });
    this.saveStoredFaces();
  }
  
  /**
   * Check if a face has been seen before, returns voterId if match found
   */
  public recognizeFace(descriptor: Float32Array, threshold: number = 0.6): string | null {
    if (this.storedFaces.length === 0) return null;
    
    // Find the closest match
    let closestMatch: { distance: number, voterId: string } = { 
      distance: Infinity, 
      voterId: '' 
    };
    
    for (const face of this.storedFaces) {
      const distance = this.calculateDistance(descriptor, face.descriptor);
      if (distance < closestMatch.distance) {
        closestMatch = {
          distance,
          voterId: face.voterId
        };
      }
    }
    
    // Return the match if it's below the threshold
    return closestMatch.distance < threshold ? closestMatch.voterId : null;
  }
  
  /**
   * Clear all stored faces
   */
  public clearAllFaces(): void {
    this.storedFaces = [];
    this.saveStoredFaces();
  }
}

// Create a singleton instance
export const faceRecognition = new FaceRecognitionService();
