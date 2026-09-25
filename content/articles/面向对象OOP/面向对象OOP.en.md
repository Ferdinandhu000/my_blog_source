---
title: Java object-oriented programming
slug: java-object-oriented-programming
date: '2025-05-17T14:16:29+08:00'
category: Java Fundamentals
draft: false
tags:
- Java
- Object-oriented
---
# Java Object-oriented Programming (OOP)

## Contents
- [Object-oriented] (#面向对象)
  - [What is object-oriented]#什么是面向对象)
  - [Object-oriented vs process-oriented]#面向对象-vs-面向过程)
- [Category and object](#类和对象)
  - [Definition and use](#定义和使用)
  - [Constructive Functions](#构造函数)
  - [Simplified form of definition in Java](#java中类定义的最简形式)
- [public private status final]#public-private-static-final-关键字)
  - [public and private]#public-和-private)
  - [static](#static)
  - [final](#final)
- [The three characteristics of the object]#面向对象三大特性)
  - [1. Envelope](#1-封装)
  - [2. Succession]#2-继承)
  - [3. Multi-state](#3-多态)

---

## Object-oriented

### What's object-oriented?
Generally speaking, object-oriented is the process by which each object has its own ** attributes** and ** methods** and is encapsulated.

### Object-oriented vs process
| Feature | Object-oriented (OOP) | Process-oriented (POP) |
|------|---------------|---------------|
♪ Focus ♪
Application scenes Complex system development Small program development
♪ Maintenance, maintenance, high, low, low ♪
| Code reuse | strong | weak |

![OOP vs POP对比图](https://raw.githubusercontent.com/Ferdinandhu000/my_blog_img/master/OOP%20vs%20POP.png)

---

## Classes and Objects

### Definition and use
- ** Class**: Template for Object
  Includes: attributes and methods
- **Object**: examples of categories
- ** Example:**
  - Category: Persons
  - Target: Students, teachers

### Construct Functions
** Format**:`public 类名 (传入的属性) {}`
```java
class Employee {
    // 属性
    private static String name;
    private double salary;
    private LocalDate hireDay;

    // 默认的无参构造函数
    public Employee() {
    }
}
```

Use`this`Keywords to access properties of the current object and method
```java
class Employee {
    private String name;
    private double salary;
    private LocalDate hireDay;

    // 默认构造函数
    public Employee() {
    }

    // 带参数的构造函数
    public Employee(String name, double salary, int year, int month, int day) {
        this.name = name;
        this.salary = salary;
        this.hireDay = LocalDate.of(year, month, day);
    }
}
```

> **Note: One class may include multiple tectonic functions (reloading)

### The simplest form of definition in Java
```java
class ClassName { 
    属性1
    属性2
    ... 
    构造函数1
    构造函数2 
    ... 
    方法1
    方法2 
    ... 
} 
```

---
## Keywords

### Public and Private
- Both are access rights amplifiers to limit or allow outside access to internal members of the class, which may be modified ** class** attributes** method**
    - **public**: to indicate that the object members are publicly available and available throughout the project
    - **private**: indicates that the target members are completely private and are not allowed any outside visits

### static
- If it means static, it can be modified ** class** method** ** code block**
- ** Features**:
    - modifies the attribute, the attribute will be in the memory and only the only one will be stored. So it's possible.`类名.属性名`Direct access, without creating a single object to access again
      For example:`Math.PI`
    - You can also pass when you fix it.`类名.方法名`Direct Call
      例如：`Math.sin()`
      However, other non-static members in this category cannot be used directly in static methods
    ```java
    class Test {
        String name;
        public static int id;
        public static void showInfo1() {
            System.out.println("id:" + id); // id是static，不会报错

            System.out.println("name:" + name);  // name不是staitc，这行代码会报错！
        }
    }
    ```
    - When modifying the code blocks, only static methods will be executed quickly and only once when class loads
    ```java
    static {
        System.out.println("静态代码块"); // 只在最开始执行一次，之后不会执行
    }

    {
        System.out.println("普通代码块"); // 只要类被加载，就会执行这段代码
    }
    ```

### final
- It means the members of the adornment are immutable.
- ** Features**:
    - When modifying a variable, initializing a copy must be performed and the value cannot be modified when used at any location
    - When you fix it, you can't weigh it. Write
    - And when it's modified, it can't be inherited.

---

## Three properties for object orientation

### 1. Cover
PHYSICAL VISION
|----------------------|:-------:|:-------:|:---------:|:------:|
It's the same kind of bag.
It's a different kind of bag.
The sub-groups in the different bags, the sub-groups, the sub-groups, the sub-groups.
♪ It's different ♪

### 2. Succession
- ** Meaning**: to create a new class (subcategory) based on existing classes (paternity) by adding new attributes and methods to achieve reuse of duplicate codes and reduce code volume
- ** Achieved**:
    - When creating class, use`extends`Keyword Inheritance Parent
      格式： `public class 子类名 extends 父类名 {}`
      Use when accessing a member variable or method in a parent category`super`Keyword
    ```java
    // 父类 Employee
    public class Employee {
        private String name = "Hanmei";
        private double salary;

        public Employee(String name, double salary) {} // 构造函数

        public String getName() {}
        public double raiseSalary(double byPercent) {}
        public double getSalary() {}
    }
    ```
    ```java
    // 子类 Manager
    public class Manager extends Employee {
        // 在父类基础上添加新属性 bonus
        private double bonus;

        public Manager(String name, double salary) {
            super(name, salary); // 使用super获取父类中的属性
        }

        public void setBonus(double bonus) {
            this.bonus = bonus;
        }
        // 重写父类getsalary()函数
        public double getSalary() {
            return super.getSalary() + bonus; //使用super获取父类中的方法
        }
    }
    ```
- **Inheritance characteristics**
    - There are several levels of succession:`Person <-- Employee <-- Manager`
    - How many parts can inherit?

### 3. Plurality
- ** Meaning**: under inheritance systems, when the subcategory is rewritten to the parent method, create the sub-object and call the method, and the procedure is executed by the method in the corresponding category
- ** Achieved**:
    See the code that you inherited from above when you execute the code below.
    ```java
    Employee Alice = new Manager("Alice",10000); // 声明类型是Employee，实际类型是Manager
    Alice.setBonous(5000);

    Alice.getSalary();
    ```
    The program will output 15,000 instead of 10,000 because the program is rewrited in Manager, even though Alice's statement is about Employeee.

- ** with special attention**:
    For the next code
    ```java
    class SuperClass {
        void method1() {System.out.println("SuperClass.method1");}
        void method2() {System.out.println("SuperClass.method2");}
    }

    class SubClass extends SuperClass {
        void method2() {System.out.println("SubClass.method2");}
        void method3() {System.out.println("SubClass.method3");}
    }

    public static void main(String[] args) {
        SuperClass superC = new SuperClass();
        SubClass subC = new SubClass();
        SuperClass polyC = new SubClass(); //声明类型是superClass，实际类型是SubClass

        superC.method1();
        superC.method2();
        superC.method3();
        subC.method1();
        subC.method2();
        subC.method3();
        polyC.method1();
        polyC.method2();
        polyC.method3();
    }
    ```
    Can not open message
    ```
    SuperClass.method1
    SuperClass.method2
    method3() undefined
    SuperClass.method1
    SubClass.method2
    SubClass.method3
    SuperClass.method1
    SubClass.method2
    method3() undefined // 尽管实际类型是SubClass，但是编译器只看声明类型，在SuperClass中无method3方法
    ```

- **Multi-state advantages**:
    1. Reduced coding complexity avoids the use of a large number of f-else and increases the readability of codes
    2. Increase in code scalability and reduce code modification costs