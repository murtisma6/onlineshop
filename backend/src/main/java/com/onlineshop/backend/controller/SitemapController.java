package com.onlineshop.backend.controller;

import com.onlineshop.backend.model.Product;
import com.onlineshop.backend.model.Store;
import com.onlineshop.backend.repository.ProductRepository;
import com.onlineshop.backend.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
public class SitemapController {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String getSitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Base URL - In production this should be your domain
        String baseUrl = "https://dbohramart.com"; // Official production domain
        
        // Static Pages
        addUrl(xml, baseUrl + "/", "1.0");
        addUrl(xml, baseUrl + "/login", "0.8");
        addUrl(xml, baseUrl + "/register", "0.8");
        addUrl(xml, baseUrl + "/own-your-digistore", "0.9");
        addUrl(xml, baseUrl + "/contact-us", "0.8");

        // Dynamic Store Pages
        List<Store> stores = storeRepository.findAll();
        for (Store store : stores) {
            addUrl(xml, baseUrl + "/store/" + store.getUniqueUrl(), "0.9");
        }

        // Dynamic Product Pages
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            addUrl(xml, baseUrl + "/product/" + product.getId(), "0.7");
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    private void addUrl(StringBuilder xml, String url, String priority) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(url).append("</loc>\n");
        xml.append("    <lastmod>").append(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE)).append("</lastmod>\n");
        xml.append("    <changefreq>daily</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }
}
