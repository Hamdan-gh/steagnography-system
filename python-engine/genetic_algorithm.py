import random
import numpy as np
from deap import base, creator, tools, algorithms
from metrics import calculate_psnr, calculate_ssim

class GeneticAlgorithm:
    """Genetic Algorithm for optimizing embedding positions"""
    
    def __init__(self, image_shape, data_size, population_size=20, generations=30):
        self.image_shape = image_shape
        self.data_size = data_size
        self.population_size = population_size
        self.generations = generations
        self.convergence_data = []
        
        # Create fitness and individual classes
        if not hasattr(creator, "FitnessMax"):
            creator.create("FitnessMax", base.Fitness, weights=(1.0,))
        if not hasattr(creator, "Individual"):
            creator.create("Individual", list, fitness=creator.FitnessMax)
        
        self.toolbox = base.Toolbox()
        
        # Total available positions (using RGB channels)
        self.total_positions = image_shape[0] * image_shape[1] * 3
        
        # Attribute generator - random pixel position
        self.toolbox.register("attr_position", random.randint, 0, self.total_positions - 1)
        
        # Individual generator
        self.toolbox.register("individual", tools.initRepeat, creator.Individual,
                            self.toolbox.attr_position, n=data_size)
        
        # Population generator
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)
        
        # Genetic operators
        self.toolbox.register("mate", tools.cxTwoPoint)
        self.toolbox.register("mutate", self.mutate_position)
        self.toolbox.register("select", tools.selTournament, tournsize=3)
    
    def mutate_position(self, individual):
        """Mutation operator - randomly change pixel positions"""
        mutation_rate = 0.15  # Increased from 0.1 for faster exploration
        for i in range(len(individual)):
            if random.random() < mutation_rate:
                individual[i] = random.randint(0, self.total_positions - 1)
        return individual,
    
    def evaluate_fitness(self, individual, original_image, data_bits):
        """
        Fitness function combining PSNR and SSIM
        Higher fitness = better quality
        """
        # Create a copy for embedding
        stego_image = original_image.copy()
        
        # Embed data at the positions specified by individual
        for bit_idx, position in enumerate(individual[:len(data_bits)]):
            # Convert position to image coordinates
            pixel_idx = position // 3
            channel = position % 3
            row = pixel_idx // original_image.shape[1]
            col = pixel_idx % original_image.shape[1]
            
            if row < original_image.shape[0] and col < original_image.shape[1]:
                # LSB embedding
                pixel_value = stego_image[row, col, channel]
                # Clear LSB and set to data bit
                stego_image[row, col, channel] = (pixel_value & 0xFE) | data_bits[bit_idx]
        
        # Calculate quality metrics
        psnr = calculate_psnr(original_image, stego_image)
        ssim = calculate_ssim(original_image, stego_image)
        
        # Fitness function: weighted combination
        # Higher PSNR and SSIM = better fitness
        fitness = 0.6 * psnr + 0.4 * (ssim * 100)
        
        return fitness,
    
    def optimize(self, original_image, data_bits, progress_callback=None):
        """
        Run genetic algorithm to find optimal embedding positions
        """
        # Register evaluation function with current image and data
        self.toolbox.register("evaluate", self.evaluate_fitness, 
                            original_image=original_image, data_bits=data_bits)
        
        # Create initial population
        print("Creating initial population...")
        population = self.toolbox.population(n=self.population_size)
        
        # Statistics
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("avg", np.mean)
        stats.register("max", np.max)
        
        # Evaluate initial population
        print("Evaluating initial population...")
        fitnesses = map(self.toolbox.evaluate, population)
        for ind, fit in zip(population, fitnesses):
            ind.fitness.values = fit
        
        # Run evolution
        print(f"Starting evolution for {self.generations} generations...")
        for gen in range(self.generations):
            # Select offspring
            offspring = self.toolbox.select(population, len(population))
            offspring = list(map(self.toolbox.clone, offspring))
            
            # Apply crossover
            for child1, child2 in zip(offspring[::2], offspring[1::2]):
                if random.random() < 0.6:  # reduced further from 0.7 for speed
                    self.toolbox.mate(child1, child2)
                    del child1.fitness.values
                    del child2.fitness.values
            
            # Apply mutation
            for mutant in offspring:
                if random.random() < 0.25:  # increased from 0.2 for faster convergence
                    self.toolbox.mutate(mutant)
                    del mutant.fitness.values
            
            # Evaluate individuals with invalid fitness
            invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
            fitnesses = map(self.toolbox.evaluate, invalid_ind)
            for ind, fit in zip(invalid_ind, fitnesses):
                ind.fitness.values = fit
            
            # Replace population
            population[:] = offspring
            
            # Record statistics
            record = stats.compile(population)
            self.convergence_data.append(record['max'])
            
            # Print progress and call callback
            progress_percent = ((gen + 1) / self.generations) * 100
            if gen % 5 == 0 or gen == self.generations - 1:
                print(f"Generation {gen + 1}/{self.generations} ({progress_percent:.1f}%): Max Fitness = {record['max']:.4f}")
            
            if progress_callback:
                progress_callback(gen + 1, self.generations, record['max'])
        
        # Get best individual
        best_individual = tools.selBest(population, k=1)[0]
        best_fitness = best_individual.fitness.values[0]
        
        print(f"Optimization complete! Best fitness: {best_fitness:.4f}")
        
        return {
            'best_positions': list(best_individual),
            'best_fitness': best_fitness,
            'convergence_data': self.convergence_data,
            'generations': self.generations,
            'population_size': self.population_size
        }
