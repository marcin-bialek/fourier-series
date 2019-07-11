struct CartesianPoint {
    double x, y;
};



struct PolarPoint {
    double r, phi;
};



class Complex {
    double x = 0, y = 0, r = 0, phi = 0;
    bool dirtyXY = false;
    bool dirtyRPhi = false;
    
    void update();
    
public:
    Complex() {}
    Complex(double r, double phi);
    static Complex fromXY(double x, double y);
    
    CartesianPoint toCartesian();
    PolarPoint toPolar();
    
    Complex& operator+=(Complex &b);
    Complex& operator-=(Complex &b);
    Complex& operator*=(Complex &b);
    Complex& operator/=(Complex &b);
    
    friend Complex operator+(Complex a, Complex &b);
    friend Complex operator-(Complex a, Complex &b);
    friend Complex operator*(Complex a, Complex &b);
    friend Complex operator/(Complex a, Complex &b);
    friend Complex operator~(Complex a);
};
