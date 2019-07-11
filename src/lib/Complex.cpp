#include "Complex.hpp"
#include <cmath>



Complex::Complex(double r, double phi): r(r), phi(phi) {
    dirtyRPhi = true;
}



Complex Complex::fromXY(double x, double y) {
    Complex z;
    z.x = x;
    z.y = y;
    z.dirtyXY = true;
    return z;
}



void Complex::update() {
    if(dirtyXY) {
        r = sqrt(x * x + y * y);
        if(r == 0) phi = 0;
        else if(y >= 0) phi = acos(x / r);
        else phi = -acos(x / r);
        dirtyXY = false;
    }
    else if(dirtyRPhi) {
        x = r * cos(phi);
        y = r * sin(phi);
        dirtyRPhi = false;
    }
}



CartesianPoint Complex::toCartesian() {
    update();
    return { x, y };
}



PolarPoint Complex::toPolar() {
    update();
    return { r, phi };
}



Complex& Complex::operator+=(Complex &b) {
    update();
    b.update();
    x += b.x;
    y += b.y;
    dirtyXY = true;
    return *this;
}



Complex& Complex::operator-=(Complex &b) {
    update();
    b.update();
    x -= b.x;
    y -= b.y;
    dirtyXY = true;
    return *this;
}



Complex& Complex::operator*=(Complex &b) {
    update();
    b.update();
    r *= b.r;
    phi += b.phi;
    dirtyRPhi = true;
    return *this;
}



Complex& Complex::operator/=(Complex &b) {
    update();
    b.update();
    r /= b.r;
    phi -= b.phi;
    dirtyRPhi = true;
    return *this;
}



Complex operator+(Complex a, Complex &b) {
    a += b;
    return a;
}



Complex operator-(Complex a, Complex &b) {
    a -= b;
    return a;
}



Complex operator*(Complex a, Complex &b) {
    a *= b;
    return a;
}



Complex operator/(Complex a, Complex &b) {
    a /= b;
    return a;
}



Complex operator~(Complex a) {
    a.update();
    return Complex(a.r, -a.phi);
}
