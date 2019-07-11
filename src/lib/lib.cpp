#include <cstdlib>
#include <cmath>
#include <cstdio>
#include "Complex.hpp"



struct Timestep {
    double t;
    CartesianPoint p;
};



static void prepareData(const CartesianPoint *points, Timestep *timesteps, size_t size) {
    double distance = 0;
    timesteps[0] = { 0, points[0] };
    
    for(size_t i = 1; i < size; i++) {
        distance += sqrt(pow(points[i].x - points[i - 1].x, 2) + pow(points[i].y - points[i - 1].y, 2));
        timesteps[i] = { distance, points[i] };
    }
    
    for(size_t i = 1; i < size; i++) {
        timesteps[i].t = timesteps[i].t / distance;
    }
}



static Complex func(double t, const Timestep *timesteps) {
    size_t i = 1;
    for(; t > timesteps[i].t; i++) {}
    
    double dt = timesteps[i].t - timesteps[i - 1].t;
    t = (t - timesteps[i - 1].t) / dt;
    
    double x = timesteps[i - 1].p.x + t * (timesteps[i].p.x - timesteps[i - 1].p.x);
    double y = timesteps[i - 1].p.y + t * (timesteps[i].p.y - timesteps[i - 1].p.y);
    
    return Complex::fromXY(x, y);
}



static Complex integrate(int n, Complex (*func)(double, const Timestep*), Timestep *timesteps) {
    static const double step = 0.0001;
    
    Complex sum;
    
    for(double t = 0; t <= 1; t += step) {
        auto a = Complex(1, -2 * M_PI * n * t);
        auto b = func(t, timesteps);
        auto c = Complex(step, 0);
        
        sum = (a * b * c) + sum;
    }

    return sum;
}



extern "C" PolarPoint* __attribute__((used)) calculateFourierCoefficients(CartesianPoint *points, size_t size, size_t numberOfVectors) {
    PolarPoint *vectors = (PolarPoint*)malloc(sizeof(PolarPoint) * numberOfVectors);
    Timestep *timesteps = (Timestep*)malloc(sizeof(Timestep) * size);
    prepareData(points, timesteps, size);

    for(int n = -75, i = 0; i < numberOfVectors; n++, i++) {
        vectors[i] = integrate(n, func, timesteps).toPolar();
    }

    free(timesteps);
    return vectors;
}



extern "C" void __attribute__((used)) calculateNextFrame(double t, CartesianPoint *points, const PolarPoint *fourierCoefficients, size_t size) {
    int n = -75;

    Complex previous = Complex::fromXY(0, 0);
    points[0] = { 0, 0 };

    for(size_t i = 0; i < size; i++, n++) {
        auto a = Complex(fourierCoefficients[i].r, fourierCoefficients[i].phi);
        auto b = Complex(1, M_PI / 180 * n * t);
        previous = (a * b) + previous;

        points[i + 1] = previous.toCartesian();
    }
}