---
title: "Java Interfaces and Comparators"
slug: interface
date: '2025-05-19T21:05:05+08:00'
category: Java Fundamentals
draft: false
tags:
- "Java"
- "Interfaces"
---
## Two Important Interfaces

- Comparable Interface
- Comparator Interface

## Comparable Interface

For the Arrays.sort() function, the array to be sorted needs a sorting standard
For the following Java code

```java
Person[] persons = new Person[3];
persons[0] = new Person("Han Mei");
persons[1] = new Person("Li Lei");
persons[2] = new Person("Tom");
Arrays.sort(persons);
for (Person p : persons)
    System.out.println(p);

```

There will be

```java
Person cannot be cast to java.lang.Comparable
```

Error message, so it is necessary to pass in sorting criteria

- Principle of the Comparable interface:

  ```java
  public interface Comparable {
      int compareTo(Object  other);
  }
  ```

Determine the relative size of this and other by returning an int value  
int < 0, if this < other  
int = 0, if this = other  
int > 0, if this > other

- Specific implementation

  ```java
  class Person implements Comparable{
     private String name;
     public Person(String name) {
         this.name = name;
     }
     public String toString() {
         return "A person " + name; 
     }
     // 对接口中的抽象函数进行复写
     public int compareTo(Object o) {
         Person p = (Person)o;
         return name.compareTo(p.name);
     }
  }

  public static void main(String[] args) {
      Person[] persons = new Person[3];
      persons[0] = new Person("Han Mei");
      persons[1] = new Person("Li Lei");
      persons[2] = new Person("Tom");

      // 使用sort函数进行排序
      Arrays.sort(persons);

      for (Person p : persons)
          System.out.println(p);
  }
  ```

For subclass objects inherited from the parent class, they can also inherit its interface functionality.  
If you need to change the sorting criteria, you can override its abstract methods.

## Comparator Interface

- Principle of the Comparator interface

  ```java
  public interface Comparator<T>
  {
       int compare(T first, T second);
  }
  ```

- Specific implementation

  ```java
  // 创建一个临时的类，其中补全Comparator的抽象方法
  class CompareStuMajorAsc implements Comparator<Student> {
      public int compare(Student p1, Student p2) {
          return p1.getName().compareTo(p2.getName());
      }
  }
  ```

  ```java
  Student[] stus = new Student[3];
  stus[0] = new Student("Han Mei", "E-Commerce");
  stus[1] = new Student("Li Lei", "Bioinfomatics");
  stus[2] = new Student("Tom", "Computer Science");
  // Student类继承Person的接口，默认按照name排序
  Arrays.sort(stus);
  for (Student p : stus)
    System.out.println(p);

  // new CompareStuNameAsc() 传入新排序标准，按major名称排序
  Arrays.sort(stus, new CompareStuMajorAsc());
  for (Student p : stus)
    System.out.println(p);
  ```

If you need to change it to descending order, you only need to modify the return code in the temporary class.

  ```java
  class CompareStuNameDes implements Comparator<Student> {
      public int compare(Student p1, Student p2) {
      return p2.getName().compareTo(p1.getName()); // 将p2移前
      }
  }
  ```

  - Code Simplification v1
    Use **inner classes**, that is, put the previously separate temporary classes into the main function

    ```java
    // 简化前
    class CompareIntDes implements Comparator<Integer> {
        public int compare(Integer i, Integer j) {
            return j - i;
        } 
    }
    Integer[] intArr = new Integer[] {3, 1, 2};
    Arrays.sort(intArr, new CompareIntDes());
    for (int i : intArr)
        System.out.println(i);
    
    ```

    ```java
    // 简化后
    Integer[] intArr = new Integer[] {3, 1, 2};
    Arrays.sort(intArr, new Comparator<Integer>() { // 将临时类放在sort函数中
        public int compare(Integer i, Integer j) {
            return j - i;
        }
    });
    for (int i : intArr)
        System.out.println(i);
    ```

  - Code Simplification v2
Simplify code volume using Lambda expressions
    
    ```java
    // 简化前
    // 使用内部类
    Arrays.sort(stus, new Comparator<Student>() {
        public int compare(Student s1, Student s2) {
            return s2.getMajor().compareTo(s1.getMajor());
        }
    });
    ```

    ```java
    // 简化后
    Arrays.sort(stus, (s1,s2) -> s2.getMajor().compareTo(s1.getMajor()));
    ```

    Can be done with a one-liner function  
    **注意：** 使用Lambda表达式可以看作没有使用任何一个接口，其中的`.compareTo()`方法是String类中自带的方法