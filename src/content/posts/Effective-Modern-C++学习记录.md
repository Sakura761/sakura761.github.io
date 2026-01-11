---
title: Effective-Modern-C++学习记录
published: 2025-12-11
description: ""
tags: []
category: 学习
draft: false
---
# Item 1 模板类型推导（Template Argument Deduction）
```c++
template <typename T>
void f(ParamType param)
```
## 情况1：ParamType是一个指针或者引用，但不是万能引用
如果实参是引用，会忽略其引用
```c++
template <typename T>
void f(T& param)
int x = 27;
const int cx = x;
const int &rx = x;
f(x) //T是int, param是int
f(cx)//T是const int ,param是const int&
f(rx) //T是const int, param是const int& ， rx的引用被忽略
```
```c++
template <typename T>
void f(const T& param)
int x = 27;
const int cx = x;
const int &rx = x;
f(x) //T是int, param是int
f(cx)//T是 int ,param是const int&
f(rx) //T是 int, param是const int& ， rx的引用被忽略
```
指针也是类似
```c++
template <typename T>
void f(T* param)
int x = 27;
const int *px = &x;
f(x) //T是int, param是int
f(px)//T是 const int ,param是const int*
```
## 情况2：ParamType是个万能引用
```c++
template <typename T>
void f(T&& param)
f(expr)
```
expr是左值：T和param会被推导为左值引用
expr是右值: 按照情况1的规则

## 情况3：ParamType既不是指针也不是引用
```c++
template <typename T>
void f(T param) //按值传递
f(expr)
```
忽略expr的引用、const和volatile
```c++
const char* const ptr = "hello";
f(ptr)      //T是const char*, param是const char*,因为忽略的ptr本身的const，指向的对象的const会保留，
            //也就是忽略顶层const，保留底层const
```
# Item2 auto类型推导
C++ 的 `auto` 类型推导规则虽然看起来很方便，但它的底层逻辑其实是基于 **模板实参推导（Template Argument Deduction）** 的规则。理解了模板推导，基本上就理解了 `auto`。

简单来说，当编译器看到 `auto x = expr;` 时，它会尝试推导 `auto` 到底代表什么类型。

我们将规则分为以下几种主要情况进行详细解析：

## 1. `auto` 声明为非指针、非引用的值类型 (`auto x`)

这是最常见的情况（按值传递）。
**规则：**
1.  **忽略引用（Reference）：** 如果初始化表达式是引用，引用会被忽略。
2.  **忽略顶层 const/volatile：** 如果初始化表达式有顶层 `const`（即变量本身不可变），会被忽略。
3.  **保留底层 const：** 如果是指针指向的内容是 `const`，则保留。

**示例：**
```cpp
int x = 10;
const int cx = x;
const int& rx = x;

auto a = x;   // a -> int
auto b = cx;  // b -> int (顶层 const 被忽略，b 是一个新的副本，可以修改)
auto c = rx;  // c -> int (引用被忽略，顶层 const 被忽略)

const char* const ptr = "Hello"; // 指针本身是 const，指向的内容也是 const
auto d = ptr; // d -> const char* (顶层 const 被忽略，d 可以指向别处，但指向的内容不可改)
```

## 2. `auto` 声明为指针或引用 (`auto&` 或 `auto*`)

**规则：**
1.  **不忽略 const：** 这里的 `const` 属于类型的一部分，会被保留。

**示例：**
```cpp
int x = 10;
const int cx = x;

auto& a = x;   // a -> int&
auto& b = cx;  // b -> const int& (const 被保留)

auto* c = &x;  // c -> int*
auto* d = &cx; // d -> const int*
```


## 3. `auto` 声明为万能引用 (`auto&&`)

**规则：**
1.  **如果是左值（Lvalue）：** `auto` 被推导为 **左值引用**（例如 `int&`）。
2.  **如果是右值（Rvalue）：** `auto` 被推导为 **非引用类型**（例如 `int`），因此 `auto&&` 最终变成右值引用（`int&&`）。

**示例：**
```cpp
int x = 10;

auto&& a = x;  // x 是左值 -> a 的类型是 int& (引用折叠)
auto&& b = 10; // 10 是右值 -> b 的类型是 int&&
```



## 4. 数组和函数的退化（Decay）

这与模板推导一致，取决于 `auto` 是按值还是按引用声明。

**规则：**
1.  **按值声明 (`auto x`)：** 数组退化为指针，函数退化为函数指针。
2.  **按引用声明 (`auto& x`)：** 推导为数组引用或函数引用（不退化）。

**示例：**
```cpp
const char name[] = "C++";
void func(int);

auto a = name;  // a -> const char* (数组退化为指针)
auto& b = name; // b -> const char (&)[4] (数组引用，保留长度信息)

auto c = func;  // c -> void (*)(int) (函数指针)
auto& d = func; // d -> void (&)(int) (函数引用)
```


## 5. `decltype(auto)` (C++14 起)

有时候我们希望推导出的类型与表达式 **完全一致**（包括引用和 const，不进行任何剥离），这时使用 `decltype(auto)`。

**规则：**
直接套用 `decltype` 的规则：
*   如果表达式是变量名，推导为该变量的精确类型。
*   如果表达式是产生左值的复杂表达式（加了括号），推导为引用。

**示例：**
```cpp
int x = 10;
const int& rx = x;
const int *const p = nullptr;
auto p1 = p; //p1->const int*
decltype(auto) p2 = p //p2 -> const int *const
auto a = rx;            // a -> int (常规 auto 规则，丢弃引用和 const)
decltype(auto) b = rx;  // b -> const int& (精确复制 rx 的类型)

decltype(auto) c = (x); // c -> int& (注意：(x) 是左值表达式)
```
*场景：主要用于函数返回值推导，确保返回引用时不会变成拷贝。*



## 6. 花括号初始化列表 (`{}`) 的特殊规则

这是 `auto` 和模板推导唯一不一致的地方，也是由 C++17 修正过的地方。

**规则：**
1.  **`auto x = { v };`** -> 推导为 `std::initializer_list<T>`。
2.  **`auto x { v };` (C++17 起)** -> 推导为 `v` 的类型（直接列表初始化）。

**示例：**
```cpp
auto x = { 27 }; // x -> std::initializer_list<int> 
auto y = { 27, 30 }; // y -> std::initializer_list<int>

// C++17 之前的规则比较混乱，C++17 明确如下：
auto z { 27 };   // z -> int (不是 initializer_list!)
// auto w { 27, 30 }; // 错误！直接列表初始化只能有一个元素
```