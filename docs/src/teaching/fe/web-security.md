# 常见web安全

下面是关于Web安全的完整梳理，涵盖了常见的攻击类型、攻击原理、相关防御手段以及配置方法。此内容包括XSS、CSRF、CSP的设置以及如何在Web应用中进行防御。

## 一、XSS（Cross-Site Scripting）跨站脚本攻击

### 1. 攻击原理

XSS攻击是通过将恶意脚本（通常是JavaScript）注入到网页中，当受害者访问被注入恶意脚本的页面时，浏览器会执行这些脚本，从而达到攻击的目的。攻击者通常利用XSS漏洞窃取用户的敏感信息（如Cookies、会话ID等）。

### 2. XSS攻击类型

* 存储型XSS：恶意脚本存储在目标服务器上，受害者每次访问时都会执行。
* 反射型XSS：恶意脚本直接嵌入到URL中，用户点击链接后执行。
* DOM型XSS：脚本通过修改DOM元素来执行，通常发生在客户端。

### 3. 防御方法

* 输出编码：对动态生成的内容进行输出编码，确保浏览器将恶意脚本当作普通文本而不是代码。
  > * 对HTML、JavaScript、CSS、URL等进行编码，避免特殊字符被解析为脚本。
  > * 例如，<、>、&等符号需要被转义为HTML实体。
* 输入验证与过滤：确保用户输入的数据不包含恶意脚本。
  > * 对用户输入进行严格的过滤和验证，例如使用白名单方式验证输入内容。
* HTTPOnly与Secure标志：通过设置Cookie的HTTPOnly和Secure标志来防止JavaScript访问Cookie。
  > * HTTPOnly可以防止JavaScript访问Cookie。
  > * Secure确保只有通过HTTPS连接才能发送Cookie。
* CSP（Content Security Policy）：通过限制资源加载来源，防止加载外部恶意脚本。
  > * 配置CSP头部限制脚本的加载来源，并禁用内联脚本。

### 4. CSP配置

CSP通过HTTP头部或\<meta\>标签配置，允许你限制加载的资源类型和来源，从而防止XSS攻击。

#### Nginx中设置CSP

``` nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    location / {
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' https://fonts.googleapis.com;" always;
        root /var/www/html;
        index index.html index.htm;
    }
}
```

* 这段配置限制了脚本和样式只能从同源（'self'）和特定的外部来源（如<https://apis.google.com）加载。>

## 二、CSRF（Cross-Site Request Forgery）跨站请求伪造

### 1. 攻击原理

CSRF攻击是通过欺骗用户浏览器发送恶意请求（如修改账户信息、转账等），以利用用户的身份在目标网站上执行未经授权的操作。

### 2. 防御方法

* CSRF Token：在每次用户提交敏感请求时，生成一个随机的Token，并将其附加到请求中。服务器验证该Token的正确性，防止伪造请求。

例如，使用csurf中间件为Express应用生成CSRF Token：

``` js
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);
```

* SameSite Cookie属性：通过在Cookie中设置SameSite属性来限制跨站请求，只有相同站点的请求才能发送Cookie。
  > * SameSite=Strict：完全禁止第三方请求发送Cookie。
  > * SameSite=Lax：允许某些第三方请求（如GET请求）发送Cookie。
  > * SameSite=None：允许所有请求发送Cookie（需要Secure）。

例如：

``` js
app.use(cookieParser());
app.use(csrfProtection);
res.cookie('csrfToken', token, { sameSite: 'Strict' });
```

* Referer验证：检查请求头中的Referer，确保请求来自合法的页面。

## 三、CSP（Content Security Policy）内容安全策略

### 1. 攻击原理

CSP通过限制资源加载的来源，帮助防止XSS攻击。CSP策略允许你定义一个安全的资源加载清单，防止恶意脚本或其他资源被加载。

### 2. 配置CSP头部

在Nginx中配置CSP策略时，可以通过设置Content-Security-Policy头部来控制资源加载的来源。

#### 示例1：基本CSP配置

``` nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    location / {
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' https://fonts.googleapis.com;" always;
        root /var/www/html;
        index index.html index.htm;
    }
}
```

#### 示例2：增强型CSP配置

``` nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    location / {
        add_header Content-Security-Policy "
            default-src 'self';
            script-src 'self' https://apis.google.com;
            style-src 'self' https://fonts.googleapis.com;
            img-src 'self' https://example.com;
            font-src 'self' https://fonts.gstatic.com;
            object-src 'none';
            upgrade-insecure-requests;
            block-all-mixed-content;
        " always;

        root /var/www/html;
        index index.html index.htm;
    }
}
```

该配置限制了加载脚本、样式、图片等的来源，同时禁用所有的内联脚本和插件对象，增强了页面的安全性。

### 3. CSP的关键指令

* default-src：定义所有未指定来源的资源的默认来源。
* script-src：定义脚本资源的来源。
* style-src：定义样式资源的来源。
* img-src：定义图片资源的来源。
* object-src：限制插件对象的来源。
* upgrade-insecure-requests：将所有不安全的HTTP请求自动升级为HTTPS。
* block-all-mixed-content：阻止加载所有混合内容（即HTTPS页面加载HTTP资源）。

## 四、React和Vue的XSS防御

### React的防御

* 自动转义输出：React会自动转义动态生成的内容，以确保特殊字符（如\<、\>）不会被解析为HTML或JavaScript代码。例如：

``` jsx
const name = "<script>alert('XSS')</script>";
return <div>{name}</div>;
```

上述代码会显示为\<script\>alert('XSS')\</script\>，而不是执行脚本。

* 避免使用dangerouslySetInnerHTML：React提供了dangerouslySetInnerHTML用于将HTML代码注入到DOM中，但应该避免使用这个API，因为它可能引入XSS漏洞。

### Vue的防御

* 自动转义输出：Vue同样会对所有模板内容进行自动转义，防止XSS攻击。例如：

``` html
<div>{{ userInput }}</div>
```

Vue会确保userInput中的任何HTML标签或脚本不会被执行。

v-html指令：Vue提供了v-html指令来渲染HTML内容，但使用时必须小心，确保渲染的内容是经过清洗的。

## 五、总结

* XSS防御：
  > * 输出编码、输入验证、设置HTTPOnly和Secure标志、使用CSP策略。
* CSRF防御：
  > * 使用CSRF Token、SameSite Cookie属性、Referer验证。
* CSP配置：
  > * 在Nginx中配置CSP头部，使用default-src、script-src等指令限制资源加载来源，并禁用内联脚本和混合内容。
* React与Vue：
  > * React和Vue框架通过自动转义输出和限制危险的API来有效防止XSS攻击。

通过结合这些防御措施，你可以大大提升Web应用的安全性，有效应对XSS、CSRF等常见的Web安全问题。
