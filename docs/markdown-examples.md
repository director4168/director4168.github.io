# Markdown 扩展示例

本页面演示了 VitePress 提供的一些内置 Markdown 扩展。

## 语法高亮

VitePress 提供由 [Shiki](https://github.com/shikijs/shiki) 提供支持的语法突出显示，以及行突出显示等附加功能：

**输入**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**输出**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## 定制集装箱

**输入**

```md
::: info
这是一个信息框。
:::

::: tip
这是一个提示。
:::

::: warning
这是一个警告。
:::

::: danger
这是一个危险的警告。
:::

::: details
这是一个细节块。
:::
```

**输出**

::: info
这是一个信息框。
:::

::: tip
这是一个提示。
:::

::: warning
这是一个警告。
:::

::: danger
这是一个危险的警告。
:::

::: details
这是一个细节块。
:::

## 更多的

查看 [Markdown 扩展的完整列表](https://vitepress.dev/guide/markdown) 的文档。
