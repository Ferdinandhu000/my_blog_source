---
title: "Java Interfaces"
slug: interface-of-java
date: '2025-05-17T14:15:40+08:00'
category: Java Fundamentals
draft: false
tags:
- "Java"
- "Interfaces"
---
## Interface

### Concept:
- An interface is a special type of class. Specifically, all variables in an interface are public static final, and there are no method bodies.
- It is used to set a unified standard. Subsequent classes that implement this interface need to complete the abstract methods in the interface.
- An interface can be seen as an agreement that specifies the methods that the implementing class must provide.

---

### Differences between Interface and Class
- Different keywords (using an interface can be seen as a special form of inheritance)
- All attributes defined in an interface are by default modified as public static final
- All methods defined in an interface are by default modified as public abstract and have no method body
- A class can implement multiple interfaces, but can only extend one class
- An interface can extend multiple interfaces

---

### Specific Implementation of an Interface

- In the interface class, declare an interface using the interface keyword (for example, USB)
```java
// 定义USB接口，包含输入和输出两个抽象方法
public interface USB {
    // 定义输入方法
    void input();
    // 定义输出方法
    void output();
}
```

- In a regular class (for example, Keyboard), use the 'implement' keyword to implement an interface, and override all the abstract methods in the interface
```java
// 键盘类，实现了USB接口
class Keyboard implements USB {

    // 获取键盘输入的字符串
    public String getString() {
        return "从键盘获取的字符串";
    }

    // 实现USB接口的input方法
    // 用于接收USB供电
    @Override
    public void input() {
        System.out.println("接收USB供电");
    }

    // 实现USB接口的output方法
    // 用于输出键盘获取的字符串
    @Override
    public void output() {
        System.out.println("传入从键盘获取的字符串：" + getString());
    }
}
```
---

### Notes
1. Methods in the interface must be public.
2. The implementing class must implement all abstract methods in the interface.
3. Interfaces can contain default methods and static methods.
4. Interfaces cannot contain constructors.
5. Variables in the interface are public static final by default.